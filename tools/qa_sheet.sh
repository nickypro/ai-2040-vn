#!/bin/bash
# Composite each cutout sprite over mid-grey #3a3f4a and montage a contact sheet.
set -eu
cd /workspace/media/ai-2040-vn
mkdir -p qa/ongrey
for f in assets/sprites/*.png; do
  n=$(basename "$f")
  convert "$f" -resize 280x420 -background '#3a3f4a' -flatten \
    -bordercolor '#3a3f4a' -border 6 \
    -font DejaVu-Sans -fill white -pointsize 16 -gravity south -splice 0x22 -annotate +0+2 "${n%.png}" \
    "qa/ongrey/$n"
done
montage qa/ongrey/pres_neutral.png qa/ongrey/pres_stern.png qa/ongrey/pres_weary.png \
        qa/ongrey/chen_neutral.png qa/ongrey/chen_wry.png qa/ongrey/chen_grave.png \
        qa/ongrey/reed_confident.png qa/ongrey/reed_defensive.png \
        qa/ongrey/park_neutral.png qa/ongrey/park_worried.png qa/ongrey/park_bright.png \
        qa/ongrey/niko_cheerful.png qa/ongrey/niko_serious.png qa/ongrey/niko_radiant.png \
        -tile 5x3 -geometry +4+4 -background '#222' qa/contact_sheet.png
echo "wrote qa/contact_sheet.png"
