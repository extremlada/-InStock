from django.shortcuts import render
from django.http import JsonResponse
import cv2
import numpy
from pyzbar.pyzbar import decode

def start_barcode_reader(request):
    try:
        result = barcode_readin()
        if result:
            return JsonResponse({'barcode': result[0]})
        return JsonResponse({'error': 'No barcode detected'})
    except Exception as e:
        return JsonResponse({'error': str(e)})

from django.shortcuts import render
import cv2
import numpy
from pyzbar.pyzbar import decode

def read_barcode_from_webcam():
    camera_id = 0
    delay = 1
    rtsp_url = 'http://192.168.0.124:8080/video'
    window_name = 'OpenCV Barcode'

    bd = cv2.barcode.BarcodeDetector()
    cap = cv2.VideoCapture(rtsp_url)
    cap.set(3, 640)
    cap.set(4, 480)

    while True:
        ret, frame = cap.read()
        gray = cv2.cvtColor(frame, cv2.COLOR_RGBA2GRAY)
        for barcode in decode(gray):
            myData = barcode.data.decode('utf-8')
            print(myData)
            pts = numpy.array([barcode.polygon], numpy.int32)
            pts = pts.reshape(-1, 1, 2)
            cv2.polylines(gray, [pts], True, (255, 0, 255), 5)
            pts2 = barcode.rect
            cv2.putText(gray, myData, (pts2[0], pts2[1]), cv2.FONT_HERSHEY_SIMPLEX,
                        0.9, (255, 0, 255), 2)

        cv2.imshow(window_name, gray)

        if cv2.waitKey(delay) & 0xFF == ord('q'):
            break

    cv2.destroyAllWindows()
    cap.release()

def read_barcode_from_image(image):
    img = cv2.imread(image)
    if img is None:
        print("Error: Image not found or cannot be read.")
        return None

    # Convert the image to grayscale
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Decode the barcodes
    detectedBarcodes = decode(gray_img)

    if not detectedBarcodes:
        print("barcode is not detected or your barcode is blank/corrupted")
        return None
    else:
        barcode_data = []
        for barcode in detectedBarcodes:
            barcode_data.append((barcode.data, barcode.type))
            (x, y, w, h) = barcode.rect

            cv2.rectangle(img, (x - 10, y - 10),
                          (x + w + 10, y + h + 10),
                          (255, 0, 0), 2)
            if barcode.data != "":
                print(barcode.data)
                print(barcode.type)

        cv2.imshow("Image", img)
        cv2.waitKey(2)
        cv2.destroyAllWindows()

        return barcode_data

def barcode_readin():
    rtsp_url = 'http://192.168.2.124:8080/video'
    window_name = 'OpenCV Barcode'

    cap = cv2.VideoCapture(rtsp_url)
    cap.set(3, 640)
    cap.set(4, 480)

    while True:
        ret, frame = cap.read()

        if not ret:
            print("Failed to capture frame")
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        detectedBarcodes = decode(gray)

        for barcode in decode(gray):
            myData = barcode.data.decode('utf-8')
            print(myData)
            pts = numpy.array([barcode.polygon], numpy.int32)
            pts = pts.reshape(-1, 1, 2)
            cv2.polylines(gray, [pts], True, (255, 0, 255), 5)
            pts2 = barcode.rect
            cv2.putText(gray, myData, (pts2[0], pts2[1]), cv2.FONT_HERSHEY_SIMPLEX,
                        0.9, (255, 0, 255), 2)
            cv2.imshow(window_name, frame)
            cv2.waitKey(0)
            cv2.destroyAllWindows()
            cap.release()
            return [myData]

        cv2.imshow(window_name, frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return None

## kellhet az apphoz
#def build(self):
#    self.img1=Image()
#    layout = BoxLayout()
#    layout.add_widget(self.img1)
#    #opencv2 stuffs
#    self.capture = cv2.VideoCapture(0)
#    cv2.namedWindow("CV2 Image")
#    Clock.schedule_interval(self.update, 1.0/33.0)
#    return layout
