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
      // Prefer the first pet, or use a random one if multiple pets
      selectedPet = userPets[0];
      console.log(
        `🐾 Using user's pet: ${selectedPet.name || "Unnamed"} (${selectedPet.species}/${selectedPet.breed})`
      );
    }

    // Default pets if user has none
    const defaultPets = [
      { species: "dog", breed: "Golden Retriever", personalityTraits: ["friendly", "playful"], gender: "unknown" },
      { species: "cat", breed: "British Shorthair", personalityTraits: ["curious", "independent"], gender: "unknown" },
      { species: "dog", breed: "Shiba Inu", personalityTraits: ["energetic", "loyal"], gender: "unknown" },
      { species: "cat", breed: "Maine Coon", personalityTraits: ["calm", "affectionate"], gender: "unknown" },
    ];

    if (!selectedPet) {
      selectedPet = defaultPets[Math.floor(Math.random() * defaultPets.length)];
      console.log(`🎲 Using default pet: ${selectedPet.breed} ${selectedPet.species}`);
    }

    // Extract physical characteristics
    const physicalTraits = this.getPhysicalTraits(selectedPet);

    return {
      species: selectedPet.species || "dog",
      breed: selectedPet.breed || (selectedPet.species === "cat" ? "Domestic Cat" : "Mixed Breed"),
      personality: this.translatePersonalityTraits(selectedPet.personalityTraits) || ["friendly", "happy"],
      name: selectedPet.name || null,
      gender: selectedPet.gender || "unknown",
      physicalTraits: physicalTraits,
      age: this.getAgeCategory(selectedPet.birthDate),
    };
  }

  /**
   * Get physical traits based on breed and species
   * @param {Object} pet - Pet object
   * @returns {Object} - Physical traits object
   */
  getPhysicalTraits(pet) {
    const breedTraits = {
      // Dogs
      "Golden Retriever": { size: "large", coat: "long golden", build: "athletic" },
      Labrador: { size: "large", coat: "short", build: "muscular" },
      "Shiba Inu": { size: "medium", coat: "fluffy", build: "compact" },
      Corgi: { size: "small", coat: "short", build: "short-legged" },
      Husky: { size: "large", coat: "thick fluffy", build: "athletic" },
      Poodle: { size: "medium", coat: "curly", build: "elegant" },
      Bulldog: { size: "medium", coat: "short", build: "stocky" },
      "Border Collie": { size: "medium", coat: "medium length", build: "agile" },

      // Cats
      "British Shorthair": { size: "medium", coat: "short dense", build: "robust" },
      "Maine Coon": { size: "large", coat: "long fluffy", build: "muscular" },
      Persian: { size: "medium", coat: "long silky", build: "compact" },
      Siamese: { size: "medium", coat: "short", build: "slender" },
      Ragdoll: { size: "large", coat: "semi-long", build: "large-boned" },
      "Scottish Fold": { size: "medium", coat: "short", build: "rounded" },
      Tabby: { size: "medium", coat: "striped", build: "average" },
    };

    const defaultTraits =
      pet.species === "cat"
        ? { size: "medium", coat: "short", build: "average" }
        : { size: "medium", coat: "short", build: "average" };

    return breedTraits[pet.breed] || defaultTraits;
  }

  /**
   * Get age category from birth date
   * @param {Date} birthDate - Pet's birth date
   * @returns {string} - Age category
   */
  getAgeCategory(birthDate) {
    if (!birthDate) return "adult";

    const age = (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (age < 1) return "puppy/kitten";
    if (age < 3) return "young";
    if (age < 7) return "adult";
    return "senior";
  }

  /**
   * Get place context for prompt
   * @param {Object} place - Place information
   * @returns {Object} - Place context object
   */
  getPlaceContext(place) {
    const placeType = place?.type || "dog park";
    const placeName = place?.name || "a pet-friendly place";

    console.log(`📍 Generating context for place: ${placeName} (${placeType})`);

    // Place-specific contexts with more detailed descriptions
    const placeContexts = {
      "dog park": {
        setting: "beautiful dog park",
        activity: "playing freely and socializing",
        atmosphere: "sunny outdoor environment with green grass, trees, and happy dogs playing together",
        props: "lush grass, shade trees, wooden benches, dog agility equipment, water fountains",
        mood: "joyful and energetic",
        colors: "vibrant greens and natural earth tones",
        lighting: "bright natural sunlight filtering through trees",
      },
      vet: {
        setting: "modern veterinary clinic",
        activity: "receiving gentle care and attention",
        atmosphere: "clean, professional, and caring environment with friendly staff",
        props: "examination table, stethoscope, medical charts, caring veterinarian hands",
        mood: "calm and reassuring",
        colors: "clean whites and soft blues",
        lighting: "bright, clean medical lighting",
      },
      "pet store": {
        setting: "colorful pet store",
        activity: "exploring toys and treats",
        atmosphere: "vibrant retail space filled with pet supplies and excitement",
        props: "shelves of pet food, colorful toys, leashes, treats, pet accessories",
        mood: "excited and curious",
        colors: "bright and colorful with warm lighting",
        lighting: "warm retail lighting highlighting products",
      },
      shelter: {
        setting: "welcoming animal shelter",
        activity: "meeting potential new families",
        atmosphere: "hopeful and caring environment with dedicated volunteers",
        props: "cozy kennels, adoption signs, volunteer badges, blankets, toys",
        mood: "hopeful and loving",
        colors: "warm and inviting pastels",
        lighting: "soft, warm lighting creating a homey feel",
      },
    };

    const context = placeContexts[placeType] || placeContexts["dog park"];

    // Add specific place name to context
    context.placeName = placeName;
    context.placeType = placeType;

    return context;
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

    // Detailed pet description including physical traits
    const physicalDesc = `${petInfo.physicalTraits.size} ${petInfo.physicalTraits.build} ${petInfo.species} with ${petInfo.physicalTraits.coat} coat`;
    const personalityDesc = petInfo.personality.join(" and ");
    const ageDesc = petInfo.age !== "adult" ? `${petInfo.age} ` : "";

    const petDescription = `${ageDesc}${physicalDesc}, ${personalityDesc} in nature`;

    // Place-specific activity with detailed context
    const placeActivity = `at ${placeContext.placeName}, a ${placeContext.setting}, ${contributionContext.action}`;

    // Enhanced mood description
    const moodDescription = `expressing ${contributionContext.mood} emotions, ${placeContext.mood} in the ${placeContext.atmosphere}`;

    // Rich environmental details
    const environment = `The scene features ${placeContext.props}, with ${placeContext.colors} and ${placeContext.lighting}`;

    // Celebration element with context
    const celebration = `celebrating ${contributionContext.celebration} ${contributionContext.emoji}`;

    // Technical specifications
    const technicalSpecs = "High quality illustration, detailed character design, expressive eyes, dynamic pose";

    // Combine all elements with better flow
    const prompt = `${petDescription} ${placeActivity}, ${moodDescription}, ${celebration}. ${environment}. ${baseStyle}. ${technicalSpecs}. No text, words, or letters in the image.`;

    console.log("🎨 Final generated prompt:", prompt);
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
