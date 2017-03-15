import axios from 'axios'

export default {
  
  getGalleryImages() {
    return axios.get('https://www.reddit.com/r/aww.json')
  }
}