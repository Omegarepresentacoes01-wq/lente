
export interface Location {
  latitude: number;
  longitude: number;
}

export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            uri: string;
            title: string;
            text: string;
        }[];
    }[];
  };
  web?: {
    uri: string;
    title: string;
  };
}
