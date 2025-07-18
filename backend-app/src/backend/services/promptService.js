/**
 * Prompt Service for AI Image Generation
 * Generates contextual prompts based on user, pet, place, and card information
 */

class PromptService {
  /**
   * Generate prompt for reward card image
   * @param {Object} user - User information
   * @param {Object} place - Place information
   * @param {string} contributionType - Type of contribution (first_review, milestone_achievement, community_approval)
   * @param {Object} userPets - User's pets array
   * @param {Object} reviewData - Review data for additional context
   * @returns {string} - Generated prompt for AI image generation
   */
  generateCardPrompt(user, place, contributionType, userPets = [], reviewData = null) {
    // Get pet information
    const petInfo = this.getPetInfo(userPets);

    // Get place context
    const placeContext = this.getPlaceContext(place);

    // Get contribution context
    const contributionContext = this.getContributionContext(contributionType);

    // Get review context if available
    const reviewContext = this.getReviewContext(reviewData);

    // Generate the prompt
    const prompt = this.buildPrompt({
      petInfo,
      placeContext,
      contributionContext,
      reviewContext,
      userName: user.name,
    });

    console.log("🎨 Generated prompt for card:", prompt);
    return prompt;
  }

  /**
   * Translate Chinese personality traits to English
   * @param {Array} traits - Array of personality traits (may be in Chinese)
   * @returns {Array} - Array of English personality traits
   */
  translatePersonalityTraits(traits) {
    if (!traits || !Array.isArray(traits)) return ["friendly", "happy"];

    const traitMap = {
      友好: "friendly",
      活泼: "playful",
      可爱: "cute",
      聪明: "smart",
      忠诚: "loyal",
      温柔: "gentle",
      调皮: "mischievous",
      安静: "calm",
      独立: "independent",
      好奇: "curious",
      勇敢: "brave",
      害羞: "shy",
      精力充沛: "energetic",
      爱玩: "playful",
      懒惰: "lazy",
      保护性: "protective",
    };

    return traits.map((trait) => traitMap[trait] || trait).filter((trait) => trait);
  }

  /**
   * Extract pet information for prompt
   * @param {Array} userPets - User's pets
   * @returns {Object} - Pet information object
   */
  getPetInfo(userPets) {
    let selectedPet = null;

    if (userPets && userPets.length > 0) {
      // Use a random pet from user's pets
      selectedPet = userPets[Math.floor(Math.random() * userPets.length)];
    }

    // Default pets if user has none
    const defaultPets = [
      { species: "dog", breed: "Golden Retriever", personalityTraits: ["friendly", "playful"] },
      { species: "cat", breed: "Tabby", personalityTraits: ["curious", "independent"] },
      { species: "dog", breed: "Labrador", personalityTraits: ["energetic", "loyal"] },
      { species: "cat", breed: "Persian", personalityTraits: ["calm", "affectionate"] },
    ];

    if (!selectedPet) {
      selectedPet = defaultPets[Math.floor(Math.random() * defaultPets.length)];
    }

    return {
      species: selectedPet.species || "dog",
      breed: selectedPet.breed || (selectedPet.species === "cat" ? "Domestic Cat" : "Mixed Breed"),
      personality: this.translatePersonalityTraits(selectedPet.personalityTraits) || ["friendly", "happy"],
      name: selectedPet.name || null,
    };
  }

  /**
   * Get place context for prompt
   * @param {Object} place - Place information
   * @returns {Object} - Place context object
   */
  getPlaceContext(place) {
    const placeType = place.type || "dog park";

    // Place-specific contexts
    const placeContexts = {
      "dog park": {
        setting: "dog park",
        activity: "playing and running",
        atmosphere: "outdoor, grassy, with other dogs",
        props: "grass, trees, fence, dog toys",
      },
      vet: {
        setting: "veterinary clinic",
        activity: "getting healthy checkup",
        atmosphere: "clean, caring, professional",
        props: "stethoscope, medical equipment, caring hands",
      },
      "pet store": {
        setting: "pet store",
        activity: "shopping for treats and toys",
        atmosphere: "colorful, filled with pet supplies",
        props: "pet food, toys, leashes, treats",
      },
      shelter: {
        setting: "animal shelter",
        activity: "finding a new home",
        atmosphere: "hopeful, caring, welcoming",
        props: "adoption signs, volunteers, other animals",
      },
    };

    return placeContexts[placeType] || placeContexts["dog park"];
  }

  /**
   * Get contribution context for prompt
   * @param {string} contributionType - Type of contribution
   * @returns {Object} - Contribution context object
   */
  getContributionContext(contributionType) {
    const contexts = {
      first_review: {
        mood: "excited and curious",
        action: "exploring for the first time",
        celebration: "first adventure",
        emoji: "🎉",
      },
      milestone_achievement: {
        mood: "proud and accomplished",
        action: "celebrating achievement",
        celebration: "milestone reached",
        emoji: "🏆",
      },
      community_approval: {
        mood: "happy and appreciated",
        action: "being loved by the community",
        celebration: "community favorite",
        emoji: "👍",
      },
    };

    return contexts[contributionType] || contexts["first_review"];
  }

  /**
   * Get review context for additional prompt details
   * @param {Object} reviewData - Review data
   * @returns {Object} - Review context object
   */
  getReviewContext(reviewData) {
    if (!reviewData) return null;

    const context = {
      rating: reviewData.rating || 5,
      hasPhotos: reviewData.photos && reviewData.photos.length > 0,
      tags: reviewData.tags || [],
    };

    // Add mood based on rating
    if (context.rating >= 4) {
      context.mood = "very happy";
    } else if (context.rating >= 3) {
      context.mood = "content";
    } else {
      context.mood = "neutral";
    }

    return context;
  }

  /**
   * Build the final prompt
   * @param {Object} components - All prompt components
   * @returns {string} - Final prompt
   */
  buildPrompt(components) {
    const { petInfo, placeContext, contributionContext, reviewContext, userName } = components;

    // Base style for all images
    const baseStyle =
      "Studio Ghibli inspired anime style, whimsical and magical atmosphere, hand-drawn animation style, watercolor, gentle lighting, dreamy and enchanting, Miyazaki-inspired art";

    // Pet description
    const petDescription = `${petInfo.species === "dog" ? "a" : "a"} ${petInfo.personality.join(" and ")} ${
      petInfo.breed
    } ${petInfo.species}`;

    // Place and activity
    const placeActivity = `at ${placeContext.setting} ${contributionContext.action}`;

    // Mood and atmosphere
    const moodDescription = `looking ${contributionContext.mood} and ${reviewContext?.mood || "joyful"}`;

    // Environmental details
    const environment = `surrounded by ${placeContext.atmosphere}, with ${placeContext.props}`;

    // Celebration element
    const celebration = `celebrating ${contributionContext.celebration} ${contributionContext.emoji}`;

    // Combine all elements
    const prompt = `${petDescription} ${placeActivity}, ${moodDescription}, ${celebration}. ${environment}. ${baseStyle}. No text, words, or letters in the image.`;

    return prompt;
  }

  /**
   * Generate a simpler prompt for testing
   * @param {string} petSpecies - Pet species
   * @param {string} placeType - Place type
   * @returns {string} - Simple test prompt
   */
  generateTestPrompt(petSpecies = "dog", placeType = "dog park") {
    const petInfo = this.getPetInfo([]);
    const placeContext = this.getPlaceContext({ type: placeType });
    const contributionContext = this.getContributionContext("first_review");

    return this.buildPrompt({
      petInfo: { ...petInfo, species: petSpecies },
      placeContext,
      contributionContext,
      reviewContext: null,
      userName: "Test User",
    });
  }
}

module.exports = new PromptService();
