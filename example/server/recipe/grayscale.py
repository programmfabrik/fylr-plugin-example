import numpy as np
import cv2
import sys

img = cv2.imread(sys.argv[1], 0)
cv2.imwrite(sys.argv[2], img)
