const mongoose = require('mongoose');
mongoose.pluralize(null);

const logSchema = new mongoose.Schema(
    {
        user_id: {
          type: Number,
          required: true,
        },
        data_src: {
          type: String,
          required: true,
        },
        log_data: {
          type: String,
          required: true,
        },
      },
      {
        timestamps: true,
      }
);

module.exports = mongoose.model('user_log', logSchema);