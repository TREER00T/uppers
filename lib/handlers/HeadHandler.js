const BaseHandler = require('./BaseHandler');
const ERRORS = require('../constants').ERRORS;

class HeadHandler extends BaseHandler {
  /**
   * Send the bytes received for a given file.
   *
   * @param  {object} req http.incomingMessage
   * @param  {object} res http.ServerResponse
   * @return {function}
   */
  async send(req, res) {
    const file_id = this.getFileIdFromRequest(req);
    if (file_id === false) {
      throw ERRORS.FILE_NOT_FOUND;
    }

    const file = await this.store.getOffset(file_id);

    // The Server MUST prevent the client and/or proxies from
    // caching the response by adding the Cache-Control: no-store
    // header to the response.
    res.setHeader('Cache-Control', 'no-store');

    // The Server MUST always include the Upload-Offset header in
    // the response for a HEAD request, even if the offset is 0
    res.setHeader('Upload-Offset', file.size);

    if (file.upload_length !== undefined) {
      // If the size of the upload is known, the Server MUST include
      // the Upload-Length header in the response.
      res.setHeader('Upload-Length', file.upload_length);
    }

    if (file.upload_defer_length !== undefined) {
      //  As long as the length of the upload is not known, the Server
      //  MUST set Upload-Defer-Length: 1 in all responses to HEAD requests.
      res.setHeader('Upload-Defer-Length', file.upload_defer_length);
    }

    if (file.upload_metadata !== undefined) {
      // If the size of the upload is known, the Server MUST include
      // the Upload-Length header in the response.
      res.setHeader('Upload-Metadata', file.upload_metadata);
    }

    return res.end();
  }
}

module.exports = HeadHandler;
