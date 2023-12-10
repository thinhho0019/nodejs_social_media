const reportService = require("../services/reportService")
const postService = require("../services/postService");
const fs = require('fs');
const notificationController = {
    addReport: async (req,res)=>{
        const {user,post,content} = req.body;
        const data = {
            user:user,
            post:post,
            content:content
        }
        res.status(200).json(await reportService.addReport(data));
    },
    getAllReport : async (req,res)=>{
        res.status(200).json( await reportService.getReportAll());
    },
    detailReport :async(req,res)=>{
        res.status(200).json( await reportService.detailReport(req.body.id));
    },
    violateReport: async (req,res)=>{
        const post = req.body.post;
        //update state
        await reportService.updateStateReport(post);
        //delete post 
        const listImage = await postService.getAllImagePost(post);

        listImage.image.forEach((e)=>{
            if (e) {
                console.log(e.image_url);
                fs.unlink(e.image_url, (err) => {
                  if (err) console.log(err);
                });
              }
        });
 
        await postService.deletePost(post).then(e=>{
            console.log(e);
            res.status(200).json(true);
        }).catch(e=>{
            console.log(e);
            res.status(500).json(false);
        })
    },
    noviolateReport: async (req,res)=>{
        const post = req.body.post;
        //update state
        await reportService.updateStateReport(post).then(e=>{
            res.status(200).json(true);
        }).catch(e=>{
            res.status(500).json(false);
        });
    }
}

module.exports = notificationController