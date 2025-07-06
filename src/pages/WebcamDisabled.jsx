import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';

const WebcamDisabled = () => {  
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5}}
        > 
            <div className="center-content">
                <Header showBackButton={false} />
                <h1 className="page-heading ">Camera access</h1>
                <h2>You'll need to allow <br/>camera access to snap a selfie.</h2>
                <p>If you've denied camera access <br />but would like to allow it:</p>
                <ol>
                    <li>Clear cache or delete browsing data for the browser you are using.</li>
                    <li>Refresh the page/browser to start over.</li>
                    <li>Be sure to click "Accept" or "Enable" when the Camera Access window displays.</li>
                    <li>If this doesn't work, check your device's Settings to ensure you've given permission to allow camera access in your browser.</li>
                </ol>            
                <div className="btn-container">
                    <Link to="/choose-background">
                        <button className="btn white">Got it</button>
                    </Link>
                </div>
            </div> 
        </motion.div>
    );
}

export default WebcamDisabled;