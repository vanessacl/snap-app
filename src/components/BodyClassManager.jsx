import React, { useEffect } from 'react';

const BodyClassManager = ({ className }) => {
    useEffect(() => {
        //Add as className the currentPage to the body tag
        document.body.classList.add(className);

        //Clean up by removing the class from the body when the component unmounts or className changes
        return () => {
            document.body.classList.remove(className);
        };
    }, [className]);

    return null; //This component doesn't render anything
}

export default BodyClassManager;