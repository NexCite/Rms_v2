import NexCiteMedia from "./lib/media";
import NextCiteUpload from "./lib/upload";

module NexCite {
  export class UploadService extends NextCiteUpload {}
  export class MediaService extends NexCiteMedia {}
}
export default NexCite;
