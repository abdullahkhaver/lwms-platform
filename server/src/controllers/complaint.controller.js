import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import { sendComplaintEmail } from "../utils/email.js";
import { generateTrackingId } from "../utils/helpers.js";

// Create a new complaint
export const createComplaint = async (req, res) => {
  try {
    const { name, phone, address, description, image, location } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || !phone || !address || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // Generate unique tracking ID
    const trackingId = generateTrackingId();

    // Create complaint
    const complaint = await Complaint.create({
      user: userId,
      name,
      phone,
      address,
      description,
      image,
      location,
      trackingId,
      status: "Pending",
    });

    // Populate user details
    await complaint.populate("user", "name email");

    // Send email to LWMS team
    try {
      await sendComplaintEmail(complaint);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
      trackingId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all complaints (admin only)
export const getAllComplaints = async (req, res) => {
  try {
    const { status, sortBy = "createdAt" } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const complaints = await Complaint.find(filter)
      .populate("user", "name email phone")
      .sort({ [sortBy]: -1 });

    // Calculate statistics
    const stats = {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "Pending").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      completed: complaints.filter((c) => c.status === "Completed").length,
    };

    res.status(200).json({
      success: true,
      count: complaints.length,
      stats,
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's complaints
export const getUserComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let filter = { user: userId };
    if (status) {
      filter.status = status;
    }

    const complaints = await Complaint.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get complaint by ID
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id).populate(
      "user",
      "name email phone"
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get complaint by tracking ID
export const getComplaintByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const complaint = await Complaint.findOne({ trackingId }).populate(
      "user",
      "name email phone"
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update complaint status (admin only)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["Pending", "In Progress", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user", "name email phone");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint status updated",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete complaint (admin only)
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get complaints by location (for map view)
export const getComplaintsByLocation = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      location: { $exists: true, $ne: null },
    })
      .populate("user", "name email phone")
      .select("name address description image location status trackingId createdAt");

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({
      status: "Pending",
    });
    const inProgressComplaints = await Complaint.countDocuments({
      status: "In Progress",
    });
    const completedComplaints = await Complaint.countDocuments({
      status: "Completed",
    });

    // Get complaints by status for chart
    const complaintsByStatus = await Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent complaints
    const recentComplaints = await Complaint.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        total: totalComplaints,
        pending: pendingComplaints,
        inProgress: inProgressComplaints,
        completed: completedComplaints,
        completionRate:
          totalComplaints > 0
            ? ((completedComplaints / totalComplaints) * 100).toFixed(2)
            : 0,
      },
      complaintsByStatus,
      recentComplaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Generate report
export const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    let filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    if (status) {
      filter.status = status;
    }

    const complaints = await Complaint.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    // Calculate report statistics
    const reportStats = {
      totalComplaints: complaints.length,
      pending: complaints.filter((c) => c.status === "Pending").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      completed: complaints.filter((c) => c.status === "Completed").length,
      completionRate:
        complaints.length > 0
          ? ((complaints.filter((c) => c.status === "Completed").length /
              complaints.length) *
              100).toFixed(2)
          : 0,
      generatedAt: new Date(),
      dateRange: {
        from: startDate || "All time",
        to: endDate || "All time",
      },
    };

    res.status(200).json({
      success: true,
      report: {
        stats: reportStats,
        complaints,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
