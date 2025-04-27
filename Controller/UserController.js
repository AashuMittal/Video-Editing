const express = require('express')
const sequalizeDb = require('../sequalizedb')
const Uploadvideo=require('../Model/Uploadvideo');
const { saveFile } = require('../Service/fileUploadService');
const path = require('path');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath)

exports.Videoupload=async(req,res)=>{
const {video_name,duration,size,status}=req.body;

  
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const uploadedFile = req.files.video;
  if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(uploadedFile.mimetype)) {
    return res.status(400).send({ message: 'Wrong file type. Only MP4, MOV, WEBM allowed.' });
  }
  const directory = 'uploads';
  const uploadDir = path.join(__dirname, '..', directory);
  const filePath =  await saveFile(uploadedFile, uploadDir);
  const relativePath = path.join(directory, video_name);
const video=await Uploadvideo.create({video_name,duration,size,status,path:relativePath});
try{
if(video){
 return res.status(200).send({messsage:"Successfully upload",video});
}
return res.status(500).send({messsage:"something went wrong"});
}
catch(error){
  return res.status(500).send({messsage:"error"});
}
}

exports.Videotrim = async (req, res) => {
  try {
    const { Start, End } = req.body;
    const id = req.params.id;

    const findvideo = await Uploadvideo.findOne({ where: { id } });
    if (!findvideo) {
      return res.status(400).send({ message: "Not found id" });
    }


    const inputPath = findvideo.path;
    const inputname=findvideo.video_name;
    const directory = 'trim_video';
    const uploadDir = path.join(__dirname, '..', directory);
    const outputFilePath = path.join(uploadDir, inputname);
    const relativeOutputPath = path.join(directory,inputname); 

    const start = Start ?? 0;
    const end = End ?? 0;
    const ff=ffmpeg(inputPath)
    if(start!=null){
      ff.setDuration(start)
    }
    if(end!=null){
      ff.setDuration(end-start)
    }
      ff.output(outputFilePath)
  
      ff.on('end', async () => {
        console.log('Conversion Done ✅');

        const updatetrimvideo = await Uploadvideo.update(
          { duration: end-start, path: relativeOutputPath },
          { where: { id } }
        );

        if (updatetrimvideo) {
          res.status(200).send({ message: "Successfully updated", path: relativeOutputPath });
        } else {
          res.status(500).send({ message: "Error updating database" });
        }
      })
      .on('error', (err) => {
        console.error('Error during ffmpeg processing:', err);
        res.status(500).send({ message: "Error processing video" });
      })
      .run();

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send({ message: "Server error", error });
  }
};

exports.Videosubtitles = async (req, res) => {
  try {
    const {  subtitleText, Start,End } = req.body;
    const id = req.params.id;

    const findvideo = await Uploadvideo.findOne({ where: { id } });
    if (!findvideo) {
      return res.status(400).send({ message: "Not found id" });
    }

    const inputPath = path.join(__dirname, '..', findvideo.path);
    const inputname = findvideo.video_name;
    const directory = 'subtitle_trim_video';
    const uploadDir = path.join(__dirname, '..', directory);
    const outputFilePath = path.join(uploadDir, inputname);
    const relativeOutputPath = path.join(directory, inputname); 

    const start = Start ?? 0;
    const end = End ?? 0;

    const ff = ffmpeg(inputPath);

    if (start != null && end != null) {
      ff.setStartTime(start)
        .setDuration(end - start);
    } else if (end != null) {
      ff.setDuration(end);
    } else if (start != null) {
      ff.setDuration(start);
    }

    ff.output(outputFilePath)
      .videoFilter({
        filter: 'drawtext',
        options: {
          text: subtitleText,
          fontsize: 24,
          fontcolor: 'white',
          x: '(w-text_w)/2',
          y: 'h-100',
          enable: `between(t\\,${subtitleStart}\\,${subtitleEnd})`
        }
      })
      .on('end', async () => {
        console.log('Conversion Done ✅');

        const updatetrimvideo = await Uploadvideo.update(
          { duration: end - start, path: relativeOutputPath },
          { where: { id } }
        );

        if (updatetrimvideo) {
          res.status(200).send({ message: "Successfully updated", path: relativeOutputPath });
        } else {
          res.status(500).send({ message: "Error updating database" });
        }
      })
      .on('error', (err) => {
        console.error('Error during ffmpeg processing:', err);
        res.status(500).send({ message: "Error processing video" });
      })
      .run();

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send({ message: "Server error", error });
  }
};


exports.Videorender = async (req, res) => {
  try {
    const id = req.params.id;
    const findVideo = await Uploadvideo.findOne({ where: { id } });
    if (!findVideo) {
      return res.status(400).send({ message: "Video not found" });
    }

    const inputPath = path.join(__dirname, '..', findVideo.path); 
    const inputName = findVideo.video_name;
    const directory= 'rendered_videos';
    const uploadDir = path.join(__dirname, '..', directory);
    const outputFilePath = path.join(uploadDir, inputName);
    const relativeOutputPath = path.join(directory,inputName);
    const ff = ffmpeg(inputPath);
    ff.output(outputFilePath)
      .on('end', async () => {
        console.log('🎬 Final Render Done ✅');

        const updateVideo = await Uploadvideo.update(
          { path: relativeOutputPath, status: 'rendered' },
          { where: { id } }
        );

        if (updateVideo) {
          res.status(200).send({ message: "Video rendered successfully", path: relativeOutputPath });
        } else {
          res.status(500).send({ message: "Error updating database" });
        }
      })
      .on('error', (err) => {
        console.error('❌ Error during rendering:', err);
        res.status(500).send({ message: "Error rendering video" });
      })
      .run();

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send({ message: "Server error", error });
  }
};

exports.VideoGet=async(req,res)=>{
  const id=req.params.id;
  const getvideo=await Uploadvideo.findOne({where:{id}});
  const filePath = path.join(__dirname, '..',getvideo.path);

  console.log('ss',filePath)
  if(filePath){
    return res.download(filePath);
  }
  else{
    return res.status(500).send({message:"error"});
  }
}




