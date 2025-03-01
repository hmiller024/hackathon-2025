import axios from "axios";

// Type definitions
export interface TrackedWebsite {
  id: number;
  url: string;
  lastChecked: string;
  lastHash: string;
  name?: string;
  contentChanged?: boolean;
}

export interface WebsiteRequest {
  url: string;
  content: string;
}

// Base API URL - should be configured based on your environment
const API_BASE_URL = "https://localhost:7249/api";

// API service class
class WebsiteApiService {
  // Get a specific website by ID
  async getWebsiteById(id: number): Promise<TrackedWebsite> {
    try {
      const response = await axios.get<TrackedWebsite>(
        `${API_BASE_URL}/Website/website?id=${id}`
      );
      return this.transformWebsiteData(response.data);
    } catch (error) {
      console.error("Error fetching website:", error);
      throw error;
    }
  }

  // Get all websites
  async getAllWebsites(): Promise<TrackedWebsite[]> {
    try {
      const response = await axios.get<TrackedWebsite[]>(
        `${API_BASE_URL}/Website/allWebsites`
      );
      return response.data.map((website) => this.transformWebsiteData(website));
    } catch (error) {
      console.error("Error fetching all websites:", error);
      throw error;
    }
  }

  // Add a new website
  async addWebsite(url: string, content: string): Promise<TrackedWebsite> {
    const request: WebsiteRequest = {
      url,
      content,
    };
    const response = await axios.post<WebsiteRequest>(
      `${API_BASE_URL}/Website/addWebsite`,
      request
    );

    // After successful creation, fetch all websites to get the new one with its ID
    const websites = await this.getAllWebsites();
    const newWebsite = websites.find((site) => site.url === url);

    if (newWebsite) {
      return newWebsite;
    }

    // Fallback if we can't find the exact website
    return {
      id: -1, // Placeholder ID
      url: response.data.url,
      lastChecked: new Date().toISOString(),
      lastHash: response.data.content,
      name: this.extractNameFromUrl(response.data.url),
      contentChanged: false,
    };
  }

  // Save changes to an existing website
  async updateWebsite(website: TrackedWebsite): Promise<TrackedWebsite> {
    try {
      // This would need a corresponding backend endpoint
      const response = await axios.put<TrackedWebsite>(
        `${API_BASE_URL}/Website/updateWebsite`,
        website
      );
      return this.transformWebsiteData(response.data);
    } catch (error) {
      console.error("Error updating website:", error);
      throw error;
    }
  }

  // Helper to check for website changes
  async checkForChanges(): Promise<TrackedWebsite[]> {
    try {
      // In a real implementation, you'd have an endpoint for checking changes
      const response = await axios.post<TrackedWebsite[]>(
        `${API_BASE_URL}/Website/checkChanges`
      );
      return response.data.map((website) => this.transformWebsiteData(website));
    } catch (error) {
      console.error("Error checking for changes:", error);
      // Fallback: just return current websites
      return this.getAllWebsites();
    }
  }

  // Helper method to fetch website content
  private async fetchWebsiteContent(url: string): Promise<string> {
    try {
      // In a real application, this should be done server-side
      // This is a simplified approach for demo purposes
      const response = await axios.get(url, {
        headers: {
          Accept: "text/html",
        },
      });
      return response.data.toString();
    } catch (error) {
      console.error("Error fetching website content:", error);
      return "Failed to fetch content";
    }
  }

  // Helper method to transform API data to our application format
  private transformWebsiteData(website: TrackedWebsite): TrackedWebsite {
    return {
      ...website,
      // Add name property if it doesn't exist (derived from URL)
      name: website.name || this.extractNameFromUrl(website.url),
      // Add hasChanges property if it doesn't exist
      contentChanged:
        website.contentChanged !== undefined ? website.contentChanged : false,
    };
  }

  // Helper method to extract a name from URL
  private extractNameFromUrl(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      return hostname
        .replace("www.", "")
        .split(".")
        .slice(0, -1)
        .join(".")
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } catch {
      return url;
    }
  }
}

// Export a singleton instance
export const websiteApi = new WebsiteApiService();
export default websiteApi;
