import mongoose, { Schema } from 'mongoose';

// This is the model you will be modifying
const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);

export default Note;
