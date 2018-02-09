
/*      Dependencies 
---------------------------------------------*/

var express = require('express')
  , async  = require('async')
  , User   = require(MODEL_ROOT+'users');

  


 /**
 |======================================================================================
 |    User Module start here... 
 |======================================================================================
 */


/*
 |--------------------------------------------------
 | Update Existing User Account
 |--------------------------------------------------
 */
exports.updateProfile = function(req, res) {

  User.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true }, function(err) {
    if (err) {
      return res.status(500).json({success: false, message: txt.INTERNAL_ERROR});
    }
      return res.status(200).json({
        success: true, 
        message: txt.PROFILE_UPDATED_DONE
      });
  });
};


/*
 |--------------------------------------------------
 | Delete Existing User Account
 |--------------------------------------------------
 */
exports.deleteUser = function(req, res) {
  
  var ids = req.params.ids.split(',');
  var options;
  
  User.removeByIds(ids, function(err) {
    if (err) {
      return res.status(400).json({ success: false, message: txt.BAD_REQUEST, description:err});
	}
      return res.status(200).json({
        success: true, 
        message: txt.USERS_DELETED
      });
  });
};



/*
 |--------------------------------------------------
 | Modify Password of Existing User Account
 |--------------------------------------------------
 */

exports.changePassword = function(req, res) {


  req.user.comparePassword(req.body.old_pass, function(err, isMatch) {  // matching password
    if(!isMatch) {
      return res.status(200).json({ success: false, message: txt.INVALID_PASSWORD });
    }
  });

  
  req.user.encryptPassword(req.body.new_pass, function(err, pass) {   // updating password
    if(err) {
      return res.status(500).json({ success: false, message: txt.INTERNAL_ERROR });
    }
    User.findOneAndUpdate({ password: req.user.password }, { $set: { password: pass } }, function(err) {

        if(err) return res.status(500).json({ success: false, message: txt.INTERNAL_ERROR });

        return res.status(200).json({
          success: true, 
          message: txt.PASSWORD_UPDATED_DONE
        });
    });
  })

};



/*
 |--------------------------------------------------
 | Retrieve all Users account
 |--------------------------------------------------
 */
exports.getAllUsers = function(req, res) {
  
  var condition1 = { $or: [ { role: { $ne: "Administrator" } }, { _id: { $ne: req.user._id } } ] },
      condition2 = new Object({});
  var options = JSON.parse(req.query.paging_info);

  if(req.method === "POST") {
    
    var keyword = new RegExp(req.body.keyword, "i");
    
    condition2 = { $or: [ 
      { firstname: keyword }, { lastname: keyword },
      { email: keyword }, { phone: keyword }
    ]};
  }
  
  var conditions = { $and : [ condition1, condition2 ] };
   
  options.select = "_id firstname lastname phone role created_at"; // specific fields to be show
  
  User.paginate(conditions, options, function(err, result) {
    
    if(result.total === 0) {
      return res.status(200).json({ success: true, message: txt.NO_RECORD, data: result });
    }
    
    return res.status(200).json({ success: true, data: result });
  })

};



/*
 |--------------------------------------------------
 | Retrieve all Users counts
 |--------------------------------------------------
 */
exports.usersCount = function(req, res) {


    async.parallel({
        
        total_users: function (callback) {

            User.count({}, function(err, count) {

                if(err)
                  return callback(err, false);

                  callback(false, count);
            });
        },

        online_users: function (callback) {

            User.count({status:{login:"YES"}}, function(err, count) {

                if(err)
                    return callback(err, false);

                callback(false, count);
            });
        },

        male_users: function (callback) {

            User.count({gender:"M"}, function(err, count) {

                if(err)
                    return callback(err, false);

                callback(false, count);
            });

        },

        female_users: function (callback) {

            User.count({gender:"F"}, function(err, count) {

                if(err)
                    return callback(err, false);

                callback(false, count);
            });

        }
    }, function (err, result) {

        if(err)
          return res.status(500).json({success:false, message: txt.INTERNAL_ERROR, description:err});

        return res.status(200).json({success:true, data: result});

    })



};

var multer = require('multer');
var Storage = multer.diskStorage({
  // destination
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});



exports.uploader = function(req, res) {
  console.log("uploading....")
  var upload = multer({ storage: Storage }).array("uploads[]");

  upload(req, res, function(err) {
      console.log(err);
         if (err) {
             return res.send("Something went wrong!");
         }
         console.log("uploading done")
         return res.send("File uploaded sucessfully!.");
     });
};