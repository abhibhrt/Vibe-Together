import Requests from "../../models/requests.model.js";

export const updateRequestsController = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Requests.findByIdAndUpdate(id, { duplex: true }, { new: true });
        
        return res.status(201).json({
            message: 'request updated',
            request
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};