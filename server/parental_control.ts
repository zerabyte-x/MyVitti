
export class ParentalControl {
  private static readonly RESTRICTED_KEYWORDS = [
    // Add restricted keywords here
  ];

  static isContentAppropriate(content: string): boolean {
    return !this.RESTRICTED_KEYWORDS.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  static isUserUnderAge(birthDate: Date): boolean {
    const age = Math.floor(
      (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return age < 13;
  }

  static filterContent(content: string): string {
    let filteredContent = content;
    this.RESTRICTED_KEYWORDS.forEach(keyword => {
      filteredContent = filteredContent.replace(
        new RegExp(keyword, 'gi'),
        '*'.repeat(keyword.length)
      );
    });
    return filteredContent;
  }
}
