import argparse
import asyncio
import json
import logging
import os
import ssl
import uuid
import numpy as np

from keras.preprocessing.image import img_to_array
from keras.models import load_model
from PIL import Image, ExifTags

import cv2
from aiohttp import web
from av import VideoFrame

from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder

ROOT = os.path.dirname(__file__)

logger = logging.getLogger("pc")
pcs = set()

emotions = ['anger', 'disgust', 'fear', 'happiness', 'sadness', 'surprise', 'neutral']

detection_model_path = 'backend/haarcascade_files/haarcascade_frontalface_default.xml'
emotion_model_path = 'backend/models/_best_tf-bs8.56-0.83.hdf5'

face_detection = cv2.CascadeClassifier(detection_model_path)
emotion_classifier = load_model(emotion_model_path, compile=False)


def detect_faces(frame):
    # BGR -> Gray conversion
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Cascade MultiScale classifier
    detected_faces = face_detection.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5,
        minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE)

    for (i, (x, y, w, h)) in enumerate(detected_faces):
        face = gray[y:y + h, x:x + w]
        face = cv2.resize(face, (48, 48))
        face = face.astype("float") / 255.0
        face = img_to_array(face)
        face = np.expand_dims(face, axis=0)

        predictions = emotion_classifier.predict(face)[0]
        emotion_probability = np.max(predictions)
        label = emotions[predictions.argmax()]

        # Add rectangle
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 255, 255), 2)
        # cv2.putText(frame, "Face #{}".format(i + 1), (x - 10, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        cv2.putText(frame, label, (x - 10, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # # Add prediction probabilities
        # cv2.putText(frame, "----------------", (40, 100 + 180 * i), cv2.FONT_HERSHEY_SIMPLEX, 0.5, 155, 0)
        # cv2.putText(frame, "Emotional report : Face #" + str(i + 1), (40, 120 + 180 * i), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
        #             155, 0)
        # cv2.putText(frame, emotions[0] + str(round(predictions[0], 3)), (40, 140 + 180 * i),
        #             cv2.FONT_HERSHEY_SIMPLEX,
        #             0.5, 155, 0)
        # cv2.putText(frame, emotions[1] + str(round(predictions[1], 3)), (40, 160 + 180 * i),
        #             cv2.FONT_HERSHEY_SIMPLEX, 0.5, 155, 0)
        # cv2.putText(frame, emotions[2] + str(round(predictions[2], 3)), (40, 180 + 180 * i),
        #             cv2.FONT_HERSHEY_SIMPLEX,
        #             0.5, 155, 1)
        # cv2.putText(frame, emotions[3] + str(round(predictions[3], 3)), (40, 200 + 180 * i),
        #             cv2.FONT_HERSHEY_SIMPLEX,
        #             0.5, 155, 1)
        # cv2.putText(frame, emotions[4] + str(round(predictions[4], 3)), (40, 220 + 180 * i),
        #             cv2.FONT_HERSHEY_SIMPLEX,
        #             0.5, 155, 1)
        # cv2.putText(frame, emotions[5] + str(round(predictions[5], 3)), (40, 240 + 180 * i),
        #             cv2.FONT_HERSHEY_SIMPLEX, 0.5, 155, 1)
        # cv2.putText(frame, emotions[6] + str(round(predictions[6], 3)), (40, 260 + 180 * i),
        #             cv2.FONT_HERSHEY_SIMPLEX, 0.5, 155, 1)

        # Annotate main image with label
        # cv2.putText(frame, label, (x + w - 10, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)

    return frame


class VideoTransformTrack(MediaStreamTrack):
    """
    A video stream track that transforms frames from an another track.
    """

    kind = "video"

    def __init__(self, track):
        super().__init__()  # don't forget this!
        self.track = track

    async def recv(self):
        frame = await self.track.recv()

        img = frame.to_ndarray(format="bgr24")
        img = detect_faces(img)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # faces = face_detection.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30),
        #                                              flags=cv2.CASCADE_SCALE_IMAGE)
        # if len(faces) > 0:
        #     faces = sorted(faces, reverse=True, key=lambda x: (x[2] - x[0]) * (x[3] - x[1]))[0]
        #     (fX, fY, fW, fH) = faces
        #     roi = gray[fY:fY + fH, fX:fX + fW]
        #     roi = cv2.resize(roi, (48, 48))
        #     roi = roi.astype('float') / 255.0
        #     roi = img_to_array(roi)
        #     roi = np.expand_dims(roi, axis=0)
        #
        #     preds = emotion_classifier.predict(roi)[0]
        #     emotion_probability = np.max(preds)
        #     label = emotions[preds.argmax()]
        #     # for (i, (emotion, prob)) in enumerate(zip(self.emotions, preds)):
        #     #     # construct the label text
        #     #     # text = "{}: {:.2f}%".format(emotion, prob * 100)
        #     #
        #     #     # draw the label + probability bar on the canvas
        #     #     # emoji_face = feelings_faces[np.argmax(preds)]
        #     #
        #     #     # w = int(prob * 300)
        #     #     # cv2.rectangle(canvas, (7, (i * 35) + 5),
        #     #     #             (w, (i * 35) + 35), (0, 0, 255), -1)
        #     #     # cv2.putText(canvas, text, (10, (i * 35) + 23),
        #     #     #             cv2.FONT_HERSHEY_SIMPLEX, 0.45,
        #     #     #             (255, 255, 255), 2)
        #     cv2.putText(img, label, (fX, fY - 10),
        #                 cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 2)
        #     cv2.rectangle(img, (fX, fY), (fX + fW, fY + fH),
        #                   (0, 0, 255), 2)

        # rebuild a VideoFrame, preserving timing information
        new_frame = VideoFrame.from_ndarray(img, format="bgr24")
        new_frame.pts = frame.pts
        new_frame.time_base = frame.time_base
        return new_frame

async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = RTCPeerConnection()
    pc_id = "PeerConnection(%s)" % uuid.uuid4()
    pcs.add(pc)

    def log_info(msg, *args):
        logger.info(pc_id + " " + msg, *args)

    log_info("Created for %s", request.remote)

    @pc.on("datachannel")
    def on_datachannel(channel):
        @channel.on("open")
        def on_open():
            print("s-a deschis dc")

        @channel.on("message")
        def on_message(message):
            if isinstance(message, str) and message.startswith("ping"):
                channel.send("pong" + message[4:])

    @pc.on("iceconnectionstatechange")
    async def on_iceconnectionstatechange():
        log_info("ICE connection state is %s", pc.iceConnectionState)
        if pc.iceConnectionState == "failed":
            await pc.close()
            pcs.discard(pc)

    @pc.on("track")
    def on_track(track):
        log_info("Track %s received", track.kind)

        if track.kind == "video":
            local_video = VideoTransformTrack(track)
            pc.addTrack(local_video)

        @track.on("ended")
        async def on_ended():
            log_info("Track %s ended", track.kind)

    # handle offer
    await pc.setRemoteDescription(offer)

    # send answer
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.Response(
        content_type="application/json",
        text=json.dumps(
            {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
        ),
    )

async def detect_image(request):
    data = await request.post()
    data_image = data['detect-image'].file

    image = Image.open(data_image)

    for orientation in ExifTags.TAGS.keys() :
        if ExifTags.TAGS[orientation]=='Orientation' : break
    exif=dict(image._getexif().items())

    if   exif[orientation] == 3 :
        image=image.rotate(180, expand=True)
    elif exif[orientation] == 6 :
        image=image.rotate(270, expand=True)
    elif exif[orientation] == 8 :
        image=image.rotate(90, expand=True)

    image = np.asarray(image)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    image = detect_faces(image)

    (flag, encodedImage) = cv2.imencode('.jpg', image)
    return web.Response(body=bytearray(encodedImage), content_type="image/jpg")

async def on_shutdown(app):
    # close peer connections
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="WebRTC audio / video / data-channels demo"
    )
    parser.add_argument("--cert-file", help="SSL certificate file (for HTTPS)")
    parser.add_argument("--key-file", help="SSL key file (for HTTPS)")
    parser.add_argument(
        "--host", default="0.0.0.0", help="Host for HTTP server (default: 0.0.0.0)"
    )
    parser.add_argument(
        "--port", type=int, default=8080, help="Port for HTTP server (default: 8080)"
    )
    parser.add_argument("--verbose", "-v", action="count")
    parser.add_argument("--write-audio", help="Write received audio to a file")
    args = parser.parse_args()

    if args.verbose:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    if args.cert_file:
        ssl_context = ssl.SSLContext()
        ssl_context.load_cert_chain(args.cert_file, args.key_file)
    else:
        ssl_context = None

    app = web.Application()
    app.on_shutdown.append(on_shutdown)

    app.router.add_post("/offer", offer)
    app.router.add_post("/detect-image", detect_image)

    web.run_app(
        app, access_log=None, host=args.host, port=args.port, ssl_context=ssl_context
    )
