import { database, ref, set, get, onValue, update } from '../firebase.js';

// List of known wicketkeepers in IPL
const WICKETKEEPERS = [
  "MS Dhoni",
  "Rishabh Pant",
  "Sanju Samson",
  "Dinesh Karthik",
  "KL Rahul",
  "Jos Buttler",
  "Quinton de Kock",
  "Ishan Kishan",
  "Jitesh Sharma",
  "Heinrich Klaasen",
  "Nicholas Pooran",
  "Devon Conway"
];

class TOTSManager {
  constructor() {
    this.tots = null;
    this.playerRatings = {};
  }

  // Get first name from full name
  getFirstName(playerName) {
    if (!playerName) return '';
    // Remove any suffixes like (IP), (RP), (C), (wk) and get first name
    const cleanName = playerName.replace(/\s*\([^)]*\)\s*$/, '').trim();
    return cleanName.split(' ')[0];
  }

  // Load TOTS from Firebase
  async loadTOTS(season = "2024") {
    try {
      console.log('TOTSManager: Loading TOTS for season', season);
      const totsRef = ref(database, `tots/${season}`);
      const snapshot = await get(totsRef);
      if (snapshot.exists()) {
        console.log('TOTSManager: Found TOTS data:', snapshot.val());
        this.tots = snapshot.val();
      } else {
        console.log('TOTSManager: No TOTS data found for season', season);
        this.tots = {
          batsmen: [],
          bowlers: [],
          wicketkeeper: null,
          lastUpdated: null
        };
      }
    } catch (error) {
      console.error('TOTSManager: Error loading TOTS:', error);
    }
  }

  // Save TOTS to Firebase
  async saveTOTS(season = "2024") {
    try {
      console.log('TOTSManager: Saving TOTS for season', season);
      console.log('TOTSManager: Data to save:', this.tots);
      const totsRef = ref(database, `tots/${season}`);
      await set(totsRef, {
        ...this.tots,
        lastUpdated: new Date().toISOString()
      });
      console.log('TOTSManager: TOTS saved successfully');
    } catch (error) {
      console.error('TOTSManager: Error saving TOTS:', error);
    }
  }

  // Update player rating in Firebase
  async updatePlayerRating(playerData) {
    if (!playerData || !playerData.playerName) {
      console.log('Invalid player data:', playerData);
      return;
    }

    const firstName = this.getFirstName(playerData.playerName);
    if (!firstName) {
      console.log('Could not get first name for player:', playerData);
      return;
    }

    const playerId = `${firstName}_${playerData.team}`;
    
    if (!this.playerRatings[playerId]) {
      this.playerRatings[playerId] = {
        playerName: firstName,
        team: playerData.team,
        totalRating: 0,
        matchesPlayed: 0,
        averageRating: 0
      };
    }

    // Add rating to total if available
    if (playerData.rating) {
      this.playerRatings[playerId].totalRating += parseFloat(playerData.rating);
      this.playerRatings[playerId].matchesPlayed += 1;
      this.playerRatings[playerId].averageRating = this.playerRatings[playerId].totalRating / this.playerRatings[playerId].matchesPlayed;
    }
  }

  // Save player ratings to Firebase
  async savePlayerRatings(season = "2025") {
    try {
      console.log('Saving player ratings for season', season);
      const ratingsRef = ref(database, `RATINGS_CRICORE/${season}`);
      
      // Convert playerRatings object to array and sort by average rating
      const ratingsArray = Object.values(this.playerRatings)
        .sort((a, b) => b.averageRating - a.averageRating);
      
      await set(ratingsRef, ratingsArray);
      console.log('Player ratings saved successfully');
    } catch (error) {
      console.error('Error saving player ratings:', error);
    }
  }

  // Get player ratings for a season
  async getPlayerRatings(season = "2025") {
    try {
      const ratingsRef = ref(database, `RATINGS_CRICORE/${season}`);
      const snapshot = await get(ratingsRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return [];
    } catch (error) {
      console.error('Error getting player ratings:', error);
      return [];
    }
  }

  // Get current player ratings
  getCurrentRatings() {
    return Object.values(this.playerRatings)
      .sort((a, b) => b.averageRating - a.averageRating);
  }

  // Update TOTS with new match data
  async updateTOTS(matchRatings, season = "2024") {
    try {
      console.log('TOTSManager: Updating TOTS with match ratings for season', season);
      
      // First, update all player ratings
      for (const player of matchRatings) {
        await this.updatePlayerRating(player);
      }

      // Then, load all player ratings for the season
      const ratingsRef = ref(database, `playerRatings/${season}`);
      const snapshot = await get(ratingsRef);
      
      if (!snapshot.exists()) {
        console.error('TOTSManager: No player ratings found');
        return;
      }

      console.log('TOTSManager: Found player ratings, processing...');
      const allPlayers = [];
      snapshot.forEach((childSnapshot) => {
        const playerData = childSnapshot.val();
        allPlayers.push({
          ...playerData,
          playerId: childSnapshot.key
        });
      });

      // Reset TOTS data
      this.tots = {
        batsmen: [],
        bowlers: [],
        wicketkeeper: null,
        lastUpdated: null
      };

      // Sort all players by average rating
      allPlayers.sort((a, b) => b.averageRating - a.averageRating);

      // First, find the wicketkeeper (highest average rating keeper)
      const wicketkeepers = allPlayers
        .filter(player => WICKETKEEPERS.includes(player.playerName))
        .sort((a, b) => b.averageRating - a.averageRating);
      
      if (wicketkeepers.length > 0) {
        this.tots.wicketkeeper = wicketkeepers[0];
        // Remove keeper from allPlayers to avoid duplicate selection
        allPlayers.splice(allPlayers.indexOf(wicketkeepers[0]), 1);
      }

      // Get top 5 batsmen by average rating (excluding keeper)
      this.tots.batsmen = allPlayers
        .filter(player => !this.tots.wicketkeeper || player.playerId !== this.tots.wicketkeeper.playerId)
        .slice(0, 5);

      // Get top 5 bowlers by average rating (players with at least 1 wicket)
      const potentialBowlers = allPlayers
        .filter(player => player.wickets > 0)
        .sort((a, b) => {
          // First sort by average rating
          const ratingDiff = b.averageRating - a.averageRating;
          if (ratingDiff !== 0) return ratingDiff;
          
          // If ratings are equal, use wickets as tiebreaker
          return b.wickets - a.wickets;
        })
        .slice(0, 5);

      this.tots.bowlers = potentialBowlers;

      // Save updated TOTS
      await this.saveTOTS(season);
      console.log('TOTSManager: TOTS update completed');
    } catch (error) {
      console.error('TOTSManager: Error updating TOTS:', error);
    }
  }

  // Get current TOTS data
  getTOTS() {
    return this.tots;
  }

  // Get formatted TOTS for display
  getFormattedTOTS() {
    return {
      wicketkeeper: this.tots.wicketkeeper,
      batsmen: this.tots.batsmen,
      bowlers: this.tots.bowlers,
      lastUpdated: this.tots.lastUpdated
    };
  }
}

export default new TOTSManager(); 