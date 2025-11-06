import Activity from "../models/activity.models.js";

// Create activity
export const createActivity = async (req, res) => {
    const { activityName, userId, name } = req.body;
    const activity = await Activity.create({ activityName, userId, name });
    res.json({ message: "Activity created", activity });
};

// Get all activities
export const getAllActivity = async (req, res) => {
    const activities = await Activity.find({});
    res.json({ activities });
};
export const getNActivity = async (req, res) => {
    const activities = await Activity.find({}).limit(req.params.count).sort({ createdAt: -1 });
    res.json({ activities });
};

// Get activity by userId
export const getActivityByUserId = async (req, res) => {
    const { userId } = req.params;
    const activities = await Activity.find({ userId });
    res.json({ activities });
};

// Get activity by name
export const getActivityByName = async (req, res) => {
    const { name } = req.params;
    const activities = await Activity.find({ name });
    res.json({ activities });
};

// Update activity
export const updateActivity = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const activity = await Activity.findByIdAndUpdate(id, updates, { new: true });
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json({ message: "Activity updated", activity });
};

// Delete activity
export const deleteActivity = async (req, res) => {
    const { id } = req.params;
    const activity = await Activity.findByIdAndDelete(id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json({ message: "Activity deleted" });
};