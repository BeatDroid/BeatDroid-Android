import { SearchType } from "@/lib/types";

const tracks = [
    { searchParam: "Exits", artistName: "Foals" },
    { searchParam: "Assumptions", artistName: "Sam Gellaitry" },
    { searchParam: "Lisztomania", artistName: "Phoenix" },
    { searchParam: "Do I Wanna Know?", artistName: "Arctic Monkeys" },
    { searchParam: "A Taste of Hope", artistName: "IMANU" },
    { searchParam: "Good At Being Alone", artistName: "MYRNE" },
];

const albums = [
    { searchParam: "Abbey Road", artistName: "The Beatles" },
    { searchParam: "Hybrid Theory", artistName: "Linkin Park" },
    { searchParam: "What Went Down", artistName: "Foals" },
    { searchParam: "Skin", artistName: "Flume" },
    { searchParam: "In Search Of Solitude", artistName: "MYRNE" },
    { searchParam: "True", artistName: "Avicii" },
];

const selectPoster = (type: SearchType) => {
    switch (type) {
        case "Album":
            return albums[Math.floor(Math.random() * albums.length)];
        case "Track":
            return tracks[Math.floor(Math.random() * tracks.length)];
        default:
            return albums[Math.floor(Math.random() * albums.length)];
    }
};

export { selectPoster };

