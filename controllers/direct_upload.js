/*
 * (C) Copyright 2017 o2r project.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

// General modules
const config = require('../config/config');
var debug = require('debug')('loader:ctrl:directupload');
const fs = require('fs');
const slackBot = require('../lib/slack');

var Compendium = require('../lib/model/compendium');
var Uploader = require('../lib/uploader').Uploader;

exports.create = (req, res) => {
  if (req.body.content_type === 'compendium_v1') {
    debug('Creating new %s for user %s (original file name: %s)',
      req.body.content_type, req.user.orcid, req.file.originalname);

    var uploader = new Uploader(req, res);
    uploader.upload((id, err) => {
      if (err) {
        debug('Error during upload: %s', JSON.stringify(err));
      }
      else {
        debug('New compendium %s successfully uploaded', id);

        if (config.slack.enable) {
          let compendium_url = req.protocol + '://' + req.get('host') + '/api/v1/compendium/' + id;
          slackBot.newDirectUpload(compendium_url, req.user.orcid);
        }
      }
    });
  } else {
    res.status(500).send('Provided content_type not yet implemented, only "compendium_v1" is supported.');
    debug('Provided content_type "%s" not implemented', req.body.content_type);
  }
};
