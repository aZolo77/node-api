const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for the review"],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, "Please add some text"]
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating between 1 and 10"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  }
});

// - prevent user from submitting more then one review per bootcamp
ReviewSchema.index(
  {
    bootcamp: 1,
    user: 1
  },
  {
    unique: true
  }
);

// - static method to get average of review rating
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
  // - building pipeline(https://mongoosejs.com/docs/api.html#aggregate_Aggregate)
  const obj = await this.aggregate([
    {
      $match: {
        bootcamp: bootcampId
      }
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: {
          $avg: "$rating"
        }
      }
    }
  ]);

  try {
    // - updating bootcamps field of averageRating
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating
    });
  } catch (err) {
    console.log(err.red);
  }
};

// - call getAverageCost after save
ReviewSchema.post("save", function() {
  this.constructor.getAverageRating(this.bootcamp);
});

// - call getAverageCost before remove
ReviewSchema.pre("remove", function() {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
