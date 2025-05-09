import { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import PropTypes from "prop-types";
import "../styles/faceRegister.scss";
import { faceState } from "../store/store";
import { toast } from 'react-hot-toast';

export default function FaceVerification({ voter_ID, show, onClose, onSuccess }) {
    const webcamRef = useRef(null);
    const [imageFile, setImageFile] = useState(null);
    const [imgSrc, setImgSrc] = useState(null); // for displaying the captured image

    const { setFaceMatch } = faceState();

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

    const handleFaceVerify = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            toast.error("Please capture your image first.");
            return;
        }
        const formData = new FormData();
        formData.append("file", imageFile);

        try {
            const res = await axios.post(`http://localhost:5000/api/faces/verify?voter_id=${voter_ID}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log(res)
            if (res.data.match === true) {
                toast.success("Face verified")
            } else {
                toast.error("Face mismatched")
            }
            setFaceMatch(res.data.match)
            setImgSrc(null);
            setImageFile(null);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.log(err)
            toast.error(err.response?.data?.error || "Please try again later!");
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Verify Face</h2>
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
                <form onSubmit={handleFaceVerify}>
                    <button className="submit-btn" type="submit">Verify</button>
                </form>
                {/* <div className="message">{message}</div> */}
            </div>
        </div>
    );
}

FaceVerification.propTypes = {
    voter_ID: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
};
