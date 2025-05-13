const mongoose = require('mongoose');
const { Schema } = mongoose;



const videoSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    thumbnail: {
        type: String,
        default: 'https://via.placeholder.com/320x180'
    }
});

const sectionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    order: {
        type: Number,
        required: true
    },
    videos: [videoSchema]
});

const studentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    progress: {
        completedVideos: [{
            videoId: {
                type: Schema.Types.ObjectId,
                required: true
            },
            completedAt: {
                type: Date,
                default: Date.now
            }
        }],
        lastAccessedVideo: {
            type: Schema.Types.ObjectId
        },
        lastAccessedAt: {
            type: Date
        }
    }
});

const courseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    instructor: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    sections: [sectionSchema],
    students: [studentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for getting all videos
courseSchema.virtual('videos').get(function() {
    return this.sections.reduce((videos, section) => {
        return videos.concat(section.videos);
    }, []);
});

// Method to get student progress
courseSchema.methods.getStudentProgress = function(userId) {
    const student = this.students.find(s => s.userId.toString() === userId.toString());
    if (!student) return null;

    const totalVideos = this.videos.length;
    const completedVideos = student.progress.completedVideos.length;
    const progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

    return {
        progress,
        completedVideos: student.progress.completedVideos,
        lastAccessedVideo: student.progress.lastAccessedVideo,
        lastAccessedAt: student.progress.lastAccessedAt
    };
};

// Method to mark video as completed
courseSchema.methods.markVideoCompleted = async function(userId, videoId) {
    const student = this.students.find(s => s.userId.toString() === userId.toString());
    if (!student) return false;

    const videoExists = this.videos.some(v => v._id.toString() === videoId.toString());
    if (!videoExists) return false;

    const alreadyCompleted = student.progress.completedVideos.some(
        v => v.videoId.toString() === videoId.toString()
    );

    if (!alreadyCompleted) {
        student.progress.completedVideos.push({
            videoId,
            completedAt: new Date()
        });
        student.progress.lastAccessedVideo = videoId;
        student.progress.lastAccessedAt = new Date();
        await this.save();
    }

    return true;
};



module.exports = mongoose.model('Course', courseSchema);
