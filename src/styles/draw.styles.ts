export interface DrawStyle {
    name: string;
    pattern1: string;
    pattern2: string;
    lineWidth1: number;
    lineWidth2: number;
    lineWidth3: number;
    backgroundOpacity:number;
}

export const STYLES: DrawStyle[] = [
    {
        name: "Hand Made",
        pattern1: "hand_lines.png",
        pattern2: "hand_corss.png",
        lineWidth1: 100,
        lineWidth2: 40,
        lineWidth3: 0,
        backgroundOpacity:0.97,
    },
    {
        name: "Rock",
        pattern1: "batthern.png",
        pattern2: "rocks.jpeg",
        lineWidth1: 100,
        lineWidth2: 35,
        lineWidth3: 0,
        backgroundOpacity:0.8,
    },
    {
        name: "RPG",
        pattern1: "sand.png",
        pattern2: "grass.png",
        lineWidth1: 300,
        lineWidth2: 30,
        lineWidth3: 0,
        backgroundOpacity:0.8,
    },
];
