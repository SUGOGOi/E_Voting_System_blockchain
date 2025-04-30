import { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import PropTypes from "prop-types";
import "../styles/faceRegister.scss";

export default function FaceRegister({ show, onClose, onSuccess }) {
    const webcamRef = useRef(null);
    const [message, setMessage] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imgSrc, setImgSrc] = useState(null); // for displaying the captured image

    if (!show) return null;

    const handleBackdropClick = (e) => {
        if (e.target.className === "modal-backdrop") onClose();
    };

    // Capture the image and display it
    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc); // display the captured image
        // Convert base64 to file for upload
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => setImageFile(new File([blob], "face.png", { type: "image/png" })));
    };

    // Retake the photo
    const retake = () => {
        setImgSrc(null);
        setImageFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            setMessage("Please capture your image first.");
            return;
        }
        const formData = new FormData();
        formData.append("file", imageFile);

        try {
            const res = await axios.post("http://localhost:8000/api/faces/register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage(res.data.message);
            setImgSrc(null);
            setImageFile(null);
            if (onSuccess) onSuccess();
        } catch (err) {
            setMessage("Error: " + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Register Face</h2>
                {imgSrc ? (
                    <img src={imgSrc} alt="captured" className="webcam" />
                ) : (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/png"
                        width={320}
                        height={240}
                        className="webcam"
                    />
                )}
                <div>
                    {imgSrc ? (
                        <button className="capture-btn" onClick={retake}>Retake Photo</button>
                    ) : (
                        <button className="capture-btn" onClick={capture}>Capture Photo</button>
                    )}
                </div>
                <form onSubmit={handleSubmit}>
                    <button className="submit-btn" type="submit">Register</button>
                </form>
                <div className="message">{message}</div>
            </div>
        </div>
    );
}

FaceRegister.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
};
