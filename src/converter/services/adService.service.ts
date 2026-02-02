import type { AudioFormat, VideoFormat } from "../interfaces/converter.interface";

export class AdService {
    private mandatoryAdVideoResolutions: string[] = ['1080p', '1440p', '2160p', '4320p'];

    private minimumBitrateForAudio: number = 100; // in kbps

    public requiredAdFormats (videoFormats: VideoFormat[], audioFormats: AudioFormat[]): void {
        videoFormats.forEach(format => {
            format.requiresAd = this.mandatoryAdVideoResolutions.includes(format.resolution as string);
        });
           
        audioFormats.forEach(format => {
            const isMbOrGb = format.tbr?.toLowerCase().endsWith('mb') || format.tbr?.toLowerCase().endsWith('gb');
            const bitrate = parseInt(format.tbr?.split(' ')?.[0] || '0', 10);
            format.requiresAd = (isMbOrGb || bitrate >= this.minimumBitrateForAudio) as boolean;
        });
    }
}