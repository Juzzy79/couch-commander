import { TMDBShow, TMDBSeasonDetail } from '../types/tmdb';

export const POPULAR_SHOWS_MOCK: TMDBShow[] = [
  {
    id: 66732,
    name: 'Stranger Things',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    first_air_date: '2016-07-15',
    vote_average: 8.6,
    vote_count: 17200,
    popularity: 245.5,
    number_of_seasons: 4,
    number_of_episodes: 34,
    status: 'Returning Series',
    networks: [{ id: 213, name: 'Netflix', logo_path: '/wwemzKWzjKYJFfCeiB57q3r4Bcm.png' }],
    genres: [{ id: 18, name: 'Drama' }, { id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 9648, name: 'Mystery' }],
    seasons: [
      { id: 77680, season_number: 1, name: 'Season 1', overview: 'Strange things are afoot in Hawkins, Indiana.', poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', air_date: '2016-07-15', episode_count: 8 },
      { id: 90934, season_number: 2, name: 'Season 2', overview: 'It’s 1984 and the citizens of Hawkins are still reeling.', poster_path: '/lBO2DYq9v5cK21jL8YxW64m7yQ7.jpg', air_date: '2017-10-27', episode_count: 9 },
      { id: 115216, season_number: 3, name: 'Season 3', overview: 'One summer can change everything.', poster_path: '/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg', air_date: '2019-07-04', episode_count: 8 },
      { id: 164478, season_number: 4, name: 'Season 4', overview: 'Every ending has a beginning.', poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', air_date: '2022-05-27', episode_count: 9 }
    ]
  },
  {
    id: 100088,
    name: 'The Last of Us',
    overview: '20 years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.',
    poster_path: '/uKvVjHNqB5VmOrdxqAt2V7JMrne.jpg',
    backdrop_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    first_air_date: '2023-01-15',
    vote_average: 8.6,
    vote_count: 5100,
    popularity: 198.2,
    number_of_seasons: 1,
    number_of_episodes: 9,
    status: 'Returning Series',
    networks: [{ id: 49, name: 'HBO', logo_path: '/tuomPhY2UtuPTqqFnKMVHvSb724.png' }],
    genres: [{ id: 18, name: 'Drama' }, { id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 10759, name: 'Action & Adventure' }],
    seasons: [
      { id: 144571, season_number: 1, name: 'Season 1', overview: 'Joel and Ellie traverse a post-pandemic America.', poster_path: '/uKvVjHNqB5VmOrdxqAt2V7JMrne.jpg', air_date: '2023-01-15', episode_count: 9 }
    ]
  },
  {
    id: 95557,
    name: 'Severance',
    overview: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.',
    poster_path: '/1t7rff5UjP3eL7K9XgR2G3wS51P.jpg',
    backdrop_path: '/y4q7f4r9kGzGz5e4D8F1a3c7V9.jpg',
    first_air_date: '2022-02-18',
    vote_average: 8.4,
    vote_count: 1400,
    popularity: 180.4,
    number_of_seasons: 2,
    number_of_episodes: 19,
    status: 'Returning Series',
    networks: [{ id: 2552, name: 'Apple TV+', logo_path: '/4KAy345qLNvT42gG6Y13J4S6L0u.png' }],
    genres: [{ id: 18, name: 'Drama' }, { id: 9648, name: 'Mystery' }, { id: 10765, name: 'Sci-Fi & Fantasy' }],
    seasons: [
      { id: 135706, season_number: 1, name: 'Season 1', overview: 'The Lumon severed floor.', poster_path: '/1t7rff5UjP3eL7K9XgR2G3wS51P.jpg', air_date: '2022-02-18', episode_count: 9 },
      { id: 260381, season_number: 2, name: 'Season 2', overview: 'The truth behind Lumon industries.', poster_path: '/1t7rff5UjP3eL7K9XgR2G3wS51P.jpg', air_date: '2025-01-17', episode_count: 10 }
    ]
  },
  {
    id: 114479,
    name: 'The Bear',
    overview: 'A young chef from the fine dining world comes home to Chicago to run his family Italian beef sandwich shop after a heartbreaking death in his family.',
    poster_path: '/sHFlp4z3x4f9X6C7K2k0Q8W9P0r.jpg',
    backdrop_path: '/rIe3PnM6S7mvfP0Ym5K3h7R8V4.jpg',
    first_air_date: '2022-06-23',
    vote_average: 8.5,
    vote_count: 1900,
    popularity: 165.7,
    number_of_seasons: 3,
    number_of_episodes: 28,
    status: 'Returning Series',
    networks: [{ id: 88, name: 'FX on Hulu', logo_path: '/aOzJjoOvh0vJzFq08Vf17Vw3J9J.png' }],
    genres: [{ id: 18, name: 'Drama' }, { id: 35, name: 'Comedy' }],
    seasons: [
      { id: 171810, season_number: 1, name: 'Season 1', overview: 'Carmy takes over The Beef.', poster_path: '/sHFlp4z3x4f9X6C7K2k0Q8W9P0r.jpg', air_date: '2022-06-23', episode_count: 8 },
      { id: 228941, season_number: 2, name: 'Season 2', overview: 'Transforming The Beef into The Bear.', poster_path: '/sHFlp4z3x4f9X6C7K2k0Q8W9P0r.jpg', air_date: '2023-06-22', episode_count: 10 },
      { id: 354670, season_number: 3, name: 'Season 3', overview: 'Non-negotiables.', poster_path: '/sHFlp4z3x4f9X6C7K2k0Q8W9P0r.jpg', air_date: '2024-06-26', episode_count: 10 }
    ]
  },
  {
    id: 76479,
    name: 'The Boys',
    overview: 'A fun and irreverent take on what happens when superheroes—who are as popular as celebrities, as influential as politicians, and as revered as gods—abuse their superpowers rather than use them for good.',
    poster_path: '/2zmTngn1tYC1AvfnNDaFLSaew5P.jpg',
    backdrop_path: '/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg',
    first_air_date: '2019-07-26',
    vote_average: 8.5,
    vote_count: 9800,
    popularity: 210.3,
    number_of_seasons: 4,
    number_of_episodes: 32,
    status: 'Returning Series',
    networks: [{ id: 1024, name: 'Prime Video', logo_path: '/ifhbNuuqdan7vO1vZJAlZa6ZG3Z.png' }],
    genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 10759, name: 'Action & Adventure' }],
    seasons: [
      { id: 98721, season_number: 1, name: 'Season 1', overview: 'The Boys assemble.', poster_path: '/2zmTngn1tYC1AvfnNDaFLSaew5P.jpg', air_date: '2019-07-26', episode_count: 8 },
      { id: 133458, season_number: 2, name: 'Season 2', overview: 'On the run from Vought.', poster_path: '/2zmTngn1tYC1AvfnNDaFLSaew5P.jpg', air_date: '2020-09-04', episode_count: 8 },
      { id: 172901, season_number: 3, name: 'Season 3', overview: 'Herogasm and Soldier Boy.', poster_path: '/2zmTngn1tYC1AvfnNDaFLSaew5P.jpg', air_date: '2022-06-03', episode_count: 8 },
      { id: 247012, season_number: 4, name: 'Season 4', overview: 'Homelander consolidates power.', poster_path: '/2zmTngn1tYC1AvfnNDaFLSaew5P.jpg', air_date: '2024-06-13', episode_count: 8 }
    ]
  },
  {
    id: 1399,
    name: 'Game of Thrones',
    overview: 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.',
    poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdrop_path: '/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    first_air_date: '2011-04-17',
    vote_average: 8.4,
    vote_count: 23500,
    popularity: 310.8,
    number_of_seasons: 8,
    number_of_episodes: 73,
    status: 'Ended',
    networks: [{ id: 49, name: 'HBO', logo_path: '/tuomPhY2UtuPTqqFnKMVHvSb724.png' }],
    genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 18, name: 'Drama' }, { id: 10759, name: 'Action & Adventure' }],
    seasons: [
      { id: 3624, season_number: 1, name: 'Season 1', overview: 'Winter is coming.', poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', air_date: '2011-04-17', episode_count: 10 },
      { id: 3625, season_number: 2, name: 'Season 2', overview: 'War of the Five Kings.', poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', air_date: '2012-04-01', episode_count: 10 },
      { id: 3626, season_number: 3, name: 'Season 3', overview: 'The Red Wedding.', poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', air_date: '2013-03-31', episode_count: 10 },
      { id: 3627, season_number: 4, name: 'Season 4', overview: 'The Mountain and the Viper.', poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', air_date: '2014-04-06', episode_count: 10 },
      { id: 62090, season_number: 5, name: 'Season 5', overview: 'Hardhome.', poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', air_date: '2015-04-12', episode_count: 10 },
      { id: 71881, season_number: 6, name: 'Season 6', overview: 'Battle of the Bastards.', poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', air_date: '2016-04-24', episode_count: 10 },
      { id: 79904, season_number: 7, name: 'Season 7', overview: 'The Dragon and the Wolf.', poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', air_date: '2017-07-16', episode_count: 7 },
      { id: 107971, season_number: 8, name: 'Season 8', overview: 'The Iron Throne.', poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', air_date: '2019-04-14', episode_count: 6 }
    ]
  },
  {
    id: 1396,
    name: 'Breaking Bad',
    overview: 'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of two years left to live. He chooses to enter the dangerous world of drugs and crime.',
    poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    first_air_date: '2008-01-20',
    vote_average: 8.9,
    vote_count: 14200,
    popularity: 290.4,
    number_of_seasons: 5,
    number_of_episodes: 62,
    status: 'Ended',
    networks: [{ id: 174, name: 'AMC', logo_path: '/pmvRmATOCaDykE6JrVgrHRYioW3.png' }],
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }],
    seasons: [
      { id: 3572, season_number: 1, name: 'Season 1', overview: 'The transformation begins.', poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', air_date: '2008-01-20', episode_count: 7 },
      { id: 3573, season_number: 2, name: 'Season 2', overview: 'No half measures.', poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', air_date: '2009-03-08', episode_count: 13 },
      { id: 3575, season_number: 3, name: 'Season 3', overview: 'Los Pollos Hermanos.', poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', air_date: '2010-03-21', episode_count: 13 },
      { id: 3576, season_number: 4, name: 'Season 4', overview: 'Face Off.', poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', air_date: '2011-07-17', episode_count: 13 },
      { id: 3578, season_number: 5, name: 'Season 5', overview: 'Ozymandias and Felina.', poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', air_date: '2012-07-15', episode_count: 16 }
    ]
  }
];

export const MOCK_SEASON_EPISODES: Record<string, TMDBSeasonDetail> = {
  // Stranger Things Season 1
  '66732-1': {
    id: 77680,
    _id: 'stranger-things-s1',
    name: 'Season 1',
    overview: 'Strange things are afoot in Hawkins, Indiana.',
    season_number: 1,
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    air_date: '2016-07-15',
    episodes: [
      { id: 1198651, name: 'Chapter One: The Vanishing of Will Byers', overview: 'On his way home from a friend’s house, young Will sees something terrifying. Nearby, a sinister secret lurks in the depths of a government lab.', episode_number: 1, season_number: 1, air_date: '2016-07-15', still_path: '/9bB1yT949fL3dM1yYgB79oXm95b.jpg', vote_average: 8.4, runtime: 48 },
      { id: 1198652, name: 'Chapter Two: The Weirdo on Maple Street', overview: 'Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about an unsettling phone call.', episode_number: 2, season_number: 1, air_date: '2016-07-15', still_path: '/34x2C2W6K5lM7n1b8c0K2k0Q8W9.jpg', vote_average: 8.3, runtime: 55 },
      { id: 1198653, name: 'Chapter Three: Holly, Jolly', overview: 'An increasingly concerned Nancy looks for Barb and finds out what Jonathan\'s been up to. Joyce is convinced Will is trying to talk to her.', episode_number: 3, season_number: 1, air_date: '2016-07-15', still_path: '/9bB1yT949fL3dM1yYgB79oXm95b.jpg', vote_average: 8.7, runtime: 51 },
      { id: 1198654, name: 'Chapter Four: The Body', overview: 'Refusing to believe Will is dead, Joyce tries to connect with her son. The boys give Eleven a makeover. Nancy and Jonathan form an alliance.', episode_number: 4, season_number: 1, air_date: '2016-07-15', still_path: '/34x2C2W6K5lM7n1b8c0K2k0Q8W9.jpg', vote_average: 8.9, runtime: 50 },
      { id: 1198655, name: 'Chapter Five: The Flea and the Acrobat', overview: 'Hopper breaks into the lab while Nancy and Jonathan confront the force that took Will. The boys ask Mr. Clarke how to travel to another dimension.', episode_number: 5, season_number: 1, air_date: '2016-07-15', still_path: '/9bB1yT949fL3dM1yYgB79oXm95b.jpg', vote_average: 8.6, runtime: 52 },
      { id: 1198656, name: 'Chapter Six: The Monster', overview: 'A frantic Jonathan looks for Nancy in the darkness, but Steve\'s looking for her too. Hopper and Joyce uncover the truth about the lab\'s experiments.', episode_number: 6, season_number: 1, air_date: '2016-07-15', still_path: '/34x2C2W6K5lM7n1b8c0K2k0Q8W9.jpg', vote_average: 8.8, runtime: 49 },
      { id: 1198657, name: 'Chapter Seven: The Bathtub', overview: 'Eleven struggles to reach Will, while Lucas warns that "the bad men are coming." Dustin and Mike look for the missing girl.', episode_number: 7, season_number: 1, air_date: '2016-07-15', still_path: '/9bB1yT949fL3dM1yYgB79oXm95b.jpg', vote_average: 9.0, runtime: 42 },
      { id: 1198658, name: 'Chapter Eight: The Upside Down', overview: 'Dr. Brenner holds Hopper and Joyce for questioning while the boys wait with Eleven in the gym. Back at Will\'s, Nancy and Jonathan prepare for battle.', episode_number: 8, season_number: 1, air_date: '2016-07-15', still_path: '/34x2C2W6K5lM7n1b8c0K2k0Q8W9.jpg', vote_average: 9.3, runtime: 55 }
    ]
  },
  // The Last of Us Season 1
  '100088-1': {
    id: 144571,
    _id: 'the-last-of-us-s1',
    name: 'Season 1',
    overview: 'Joel and Ellie traverse a post-pandemic America.',
    season_number: 1,
    poster_path: '/uKvVjHNqB5VmOrdxqAt2V7JMrne.jpg',
    air_date: '2023-01-15',
    episodes: [
      { id: 3939634, name: 'When You\'re Lost in the Darkness', overview: 'Twenty years after a fungal outbreak ravages the planet, survivors Joel and Tess are tasked with a mission that could change everything.', episode_number: 1, season_number: 1, air_date: '2023-01-15', still_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg', vote_average: 8.7, runtime: 81 },
      { id: 4163935, name: 'Infected', overview: 'Tess, Joel, and Ellie traverse through a desolate and infested Boston museum, where they encounter deadly clickers.', episode_number: 2, season_number: 1, air_date: '2023-01-22', still_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg', vote_average: 8.8, runtime: 53 },
      { id: 4163936, name: 'Long, Long Time', overview: 'When a stranger approaches his compound, survivalist Bill forges an unlikely connection. Years later, Joel and Ellie seek Bill\'s guidance.', episode_number: 3, season_number: 1, air_date: '2023-01-29', still_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg', vote_average: 9.4, runtime: 75 },
      { id: 4163937, name: 'Please Hold to My Hand', overview: 'After abandoning their truck in Kansas City, Joel and Ellie attempt to escape without drawing the attention of a vindictive rebel leader.', episode_number: 4, season_number: 1, air_date: '2023-02-05', still_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg', vote_average: 8.5, runtime: 45 },
      { id: 4163938, name: 'Endure and Survive', overview: 'While attempting to evade the rebels, Joel and Ellie cross paths with the most wanted man in Kansas City.', episode_number: 5, season_number: 1, air_date: '2023-02-10', still_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg', vote_average: 9.4, runtime: 59 },
      { id: 4163939, name: 'Kin', overview: 'After months of traveling, Joel and Ellie receive a grave warning about the perils ahead and reunite with Tommy in Wyoming.', episode_number: 6, season_number: 1, air_date: '2023-02-19', still_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg', vote_average: 8.9, runtime: 58 },
      { id: 4163940, name: 'Left Behind', overview: 'As Joel fights to survive, Ellie looks back on the night that changed everything alongside her friend Riley in an abandoned mall.', episode_number: 7, season_number: 1, air_date: '2023-02-26', still_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg', vote_average: 8.5, runtime: 56 },
      { id: 4163941, name: 'When We Are in Need', overview: 'Ellie crosses paths with a vengeful group of survivors and draws the attention of its charismatic leader David.', episode_number: 8, season_number: 1, air_date: '2023-03-05', still_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg', vote_average: 9.3, runtime: 51 },
      { id: 4163942, name: 'Look for the Light', overview: 'A pregnant Anna places her trust in a lifelong friend. Later, Joel and Ellie navigate their final destination with the Fireflies in Salt Lake City.', episode_number: 9, season_number: 1, air_date: '2023-03-12', still_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg', vote_average: 9.2, runtime: 43 }
    ]
  },
  // Severance Season 1
  '95557-1': {
    id: 135706,
    _id: 'severance-s1',
    name: 'Season 1',
    overview: 'The Lumon severed floor.',
    season_number: 1,
    poster_path: '/1t7rff5UjP3eL7K9XgR2G3wS51P.jpg',
    air_date: '2022-02-18',
    episodes: [
      { id: 3237190, name: 'Good News About Hell', overview: 'Mark Scout leads a team at Lumon Industries, whose employees have undergone a severance procedure.', episode_number: 1, season_number: 1, air_date: '2022-02-18', still_path: '/y4q7f4r9kGzGz5e4D8F1a3c7V9.jpg', vote_average: 8.5, runtime: 57 },
      { id: 3237191, name: 'Half Loop', overview: 'The team trains Helly on macrodata refinement. Mark meets with a mysterious former colleague.', episode_number: 2, season_number: 1, air_date: '2022-02-18', still_path: '/y4q7f4r9kGzGz5e4D8F1a3c7V9.jpg', vote_average: 8.4, runtime: 53 },
      { id: 3237192, name: 'In Perpetuity', overview: 'Mark takes the team on a field trip to the Perpetuity Wing. Cobel investigates Mark\'s outside life.', episode_number: 3, season_number: 1, air_date: '2022-02-25', still_path: '/y4q7f4r9kGzGz5e4D8F1a3c7V9.jpg', vote_average: 8.6, runtime: 54 },
      { id: 3237193, name: 'The You You Are', overview: 'Helly conducts aggressive attempts to reach her Outie. Mark discovers a contraband book.', episode_number: 4, season_number: 1, air_date: '2022-03-04', still_path: '/y4q7f4r9kGzGz5e4D8F1a3c7V9.jpg', vote_average: 8.7, runtime: 53 },
      { id: 3237194, name: 'The Grim Barbarity of Optics and Design', overview: 'Irving explores his connection with Burt. The MDR team begins to question Lumon\'s division rivalries.', episode_number: 5, season_number: 1, air_date: '2022-03-11', still_path: '/y4q7f4r9kGzGz5e4D8F1a3c7V9.jpg', vote_average: 8.8, runtime: 43 },
      { id: 3237195, name: 'Hide and Seek', overview: 'The MDR team bonds and plans an unprecedented hallway rendezvous with Optics and Design.', episode_number: 6, season_number: 1, air_date: '2022-03-18', still_path: '/y4q7f4r9kGzGz5e4D8F1a3c7V9.jpg', vote_average: 8.9, runtime: 40 },
      { id: 3237196, name: 'Defiant Jazz', overview: 'Mark and the team awaken the wrath of Milchick. A waffle party reward leads to a dangerous plot.', episode_number: 7, season_number: 1, air_date: '2022-03-25', still_path: '/y4q7f4r9kGzGz5e4D8F1a3c7V9.jpg', vote_average: 9.3, runtime: 52 },
      { id: 3237197, name: 'What\'s for Dinner?', overview: 'The team prepares the Overtime Contingency protocol under Dylan\'s control.', episode_number: 8, season_number: 1, air_date: '2022-04-01', still_path: '/y4q7f4r9kGzGz5e4D8F1a3c7V9.jpg', vote_average: 9.2, runtime: 43 },
      { id: 3237198, name: 'The We We Are', overview: 'The Innies awake in the outside world as Dylan holds the switches in the security office.', episode_number: 9, season_number: 1, air_date: '2022-04-08', still_path: '/y4q7f4r9kGzGz5e4D8F1a3c7V9.jpg', vote_average: 9.7, runtime: 40 }
    ]
  }
};
