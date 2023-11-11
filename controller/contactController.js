const contactsRepo = require('../src/contactsFileRepository');
const Contact = require('../src/Contact')
const {validationResult} = require('express-validator');
const multer = require('multer');
const upload = multer({dest: 'tmp/'});
const fs = require('node:fs');
const zip = require('express-zip');
const crypto = require('crypto')



/* GET home page. */
exports.contacts_list = function(req, res, next) {
    const data = contactsRepo.findAll();
    console.log("Images Data Vinay Katta" +data);
    res.render('contacts', { heading: 'List Of All Contacts', title: 'Contacts Database', contacts:data });
  };
  
  /* GET Contact page. */
  exports.contacts_create_get = function(req, res, next) {
    console.log(crypto.randomUUID()); 
    res.render('contacts_add', { heading: 'Create a New Contact' , lastEdited: new Date() });
  };
  
  
  /* POST Contact page. */
  exports.contacts_create_post = 
  function(req, res, next) {
    const result = validationResult(req)
    if(!result.isEmpty()){
      res.render('contacts_add' , {heading : 'Create a New Contact' , msg : result.array()});
    }else{
      // Add data base
      let firstName = req.body.firstName.trim();
      let lastName = req.body.lastName.trim();
      let email = req.body.email.trim();
      let notes = req.body.notes.trim();
      let id = crypto.randomUUID();
      let date = new Date().toLocaleString();
      let images = [];
      if (req.files.length > 0) {
        req.files.forEach(f => {
          fs.renameSync(`${f.path}`, `public/uploads/${f.originalname}`);
          const count =  images.push(
            `uploads/${f.originalname}`
          );
          console.log('IMAGES COUNT' + count);
        });
      }
      var contactInfo = {
          id, firstName, lastName, email, notes, date, images
      };
  
      console.log('contactInfo Katta' + ' ' +firstName + ' ' +lastName +' ' + email + ' ' + notes + ' ' + images); 
      const newContact = new Contact('', contactInfo );
      console.log('XXXXXX ' + newContact)
      contactsRepo.create(newContact);
      //contactsRepo.create({contactData: contactInfo})
      console.log(newContact)
      res.redirect("/contacts");
    }
    
  };
  
  /* GET Single Contact. */
  exports.contacts_details_get = function(req, res, next) {
    const contact = contactsRepo.findById(req.params.uuid);
    console.log('AAAAAAA' + JSON.stringify(contact));
    if(contact){
      res.render('contact', { title: 'View Contact Details', contact: contact});
    }else{
      res.redirect('/contacts')
    }
   
  };

  exports.download_contacts_get = function(req, res, next) {
    const contact = contactsRepo.findById(req.params.uuid);
   
    const downloadImages = contact.contactData.images;
    console.log('DOWNLOAD CONTACT' +  downloadImages.length);
    if(downloadImages.length > 1){
      var zipDownload= [];

      downloadImages.forEach(img => 
        zipDownload.push(
          {
            path: 'public/' + img,
            name: img
          }
        )
      );
      console.log('zip download ' + JSON.stringify(zipDownload)); 
      res.zip(
      zipDownload
      );
    }else{
      res.download('public/'+downloadImages, function(err) {
        if(err) {
            console.log(err);
        }
      })
    }
    
  }

  /* Delete Contact. */
  exports.contacts_delete_get =  function(req, res, next) {
    const contact = contactsRepo.findById(req.params.uuid);
    res.render('contacts_delete', { heading: 'Delete a New Contact', contact: contact });
  };
  
  /* Confirm Delete Contact. */
  exports.contacts_delete_post =  function(req, res, next) {
    contactsRepo.deleteById(req.params.uuid);
    res.redirect('/contacts');
  };
