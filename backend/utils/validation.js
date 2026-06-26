const mongoose = require("mongoose");

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = {
  isValidObjectId
};
