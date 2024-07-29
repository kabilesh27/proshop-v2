import { validate as isUuid } from 'uuid';

/**
 * Checks if the req.params.id is a valid UUID.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Throws an error if the UUID is invalid.
 */
function checkObjectId(req, res, next) {
  console.log(isUuid(req.params.id), req.params.id);
  if (!isUuid(req.params.id)) {
    res.status(404);
    throw new Error(`Invalid UUID: ${req.params.id}`);
  }
  next();
}

export default checkObjectId;
