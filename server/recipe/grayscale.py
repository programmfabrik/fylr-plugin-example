import argparse
import json
import cv2

def main():
    # Create argument parser
    parser = argparse.ArgumentParser(description='Process an image and optionally write info JSON.')
    parser.add_argument('--in',  dest='input_file',  required=True, help='Input image file path')
    parser.add_argument('--out', dest='output_file', required=True, help='Output image file path')
    parser.add_argument('--info', dest='info', help='JSON string with additional information')

    # Parse arguments
    args = parser.parse_args()

    # Read the image in grayscale
    img = cv2.imread(args.input_file, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Cannot read image from {args.input_file}")

    data = None
    if args.info:
        try:
            data = json.loads(args.info)
        except json.JSONDecodeError:
            raise ValueError("The provided --info argument is not valid JSON.")

        # If external_url exists, render it on the bottom of the image
        external_url = data.get('external_url')
        if external_url:
            # Determine font properties
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 1.0
            font_thickness = 2
            text_color = (128, 128, 128)  # grey in BGR
            bg_color = (0, 0, 0)          # black
            text = external_url

            # Get text size
            (text_width, text_height), _ = cv2.getTextSize(text, font, font_scale, font_thickness)

            # Calculate positions
            img_height, img_width = img.shape
            x = (img_width - text_width) // 2  # center horizontally
            y = img_height - 10                 # some padding from the bottom

            # Determine where to draw background rectangle
            # We'll place a black rectangle that comfortably fits the text
            rect_top_left = (0, img_height - text_height - 20)
            rect_bottom_right = (img_width, img_height)
            cv2.rectangle(img, rect_top_left, rect_bottom_right, bg_color, -1)

            # Now put the text on top of the rectangle
            cv2.putText(img, text, (x, y), font, font_scale, text_color, font_thickness, cv2.LINE_AA)

    # Write the processed image
    if not cv2.imwrite(args.output_file, img):
        raise ValueError(f"Cannot write image to {args.output_file}")

if __name__ == '__main__':
    main()
