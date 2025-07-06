import { store } from '@risingstack/react-easy-state';

const appStore = store({
    selectedBackgroundId: null,
    processedImage: null,

    setBackgroundId(id) {
        this.selectedBackgroundId = id;
        console.log('selectedBackgroundId:', id);
    },
    setProcessedImage(image) {
        this.processedImage = image;
        console.log('processedImage:', image);
    },
});

export default appStore;