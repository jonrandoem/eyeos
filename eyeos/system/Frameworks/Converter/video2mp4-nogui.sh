#!/bin/sh

cnvaudio() {
#zenity --progress --percentage 20 --text "Audio is being converted, please wait" --title "Convert Audio" &
faac "$file.wav" -o "$file.m4a"
#killall zenity
cnvmovie
}

cnvmovie() {
#zenity --progress --percentage 30 --text "Video is being converted, please wait" --title "Convert Video" &
mencoder "$infile" -ovc x264 -x264encopts bframes=1 -nosound -of rawvideo -vf scale=-10:-1 -o "$file.h264"
#killall zenity
#zenity --progress --percentage 80 --text "Video is being muxed, please wait" --title "Mux Video" &

if [ -e "$file.m4a" ]; then
MP4Box "$file" -add "$file.h264" -add "$file.m4a"
else
MP4Box "$file" -add "$file.h264"
fi

rm "$file.wav"
rm "$file.m4a"
rm "$file.h264"

#killall zenity
#zenity --info --text "Video conversion complete. The new file can be found at $file" --title "Done"
}

E_BADARGS=65

if [ ! -n "$1" ]
then
  echo "Usage: `basename $0` argument1 argument2 etc."
  exit $E_BADARGS
fi  

echo

index=1

for arg in "$@"
do

  infile=$arg
  echo "Arg #$index = $infile"

  if [ -s "$infile" ]; then
      file="$infile.mp4"
      echo "Arg #$index = $file"
      #zenity --progress --percentage 10 --text "Audio is being converted, please wait" --title "Convert Audio" &
      ffmpeg -i "$infile" "$file.wav"
      #killall zenity
      if [ -e "$file.wav" ]; then
	  cnvaudio
      else
	  cnvmovie
      fi
  fi


  let index+=1

done