import axios from "axios";

// Type definitions
export interface TrackedWebsite {
  id: number;
  url: string;
  lastChecked: string;
  lastHash: string;
  name?: string;
  hasChanges?: boolean;
  contentChanged?: boolean;
  differences?: string;
}

export interface WebsiteRequest {
  url: string;
  content: string;
}

export interface ChatRequest {
  websiteName: string;
  websiteUrl: string;
}

export interface ChangeAnalysisRequest extends ChatRequest {
  differences: string;
}

export interface ChatResponse {
  message: string;
}

export interface WebsiteWithChatResponse {
  website: TrackedWebsite;
  chatAnalysis: string;
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
  async addWebsite(url: string, name: string): Promise<TrackedWebsite> {
    try {
      const request: WebsiteRequest = {
        url,
        content: name || this.extractNameFromUrl(url),
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
        lastHash: "", // We don't have this info from the response
        name: name || this.extractNameFromUrl(response.data.url),
        hasChanges: false,
      };
    } catch (error) {
      console.error("Error adding website:", error);
      throw error;
    }
  }

  // Add a new website with AI chat analysis
  async addWebsiteWithChat(
    url: string,
    name: string
  ): Promise<WebsiteWithChatResponse> {
    try {
      const request: WebsiteRequest = {
        url,
        content: name || this.extractNameFromUrl(url),
      };

      const response = await axios.post<WebsiteWithChatResponse>(
        `${API_BASE_URL}/Website/addWebsiteWithChat`,
        request
      );

      return {
        website: this.transformWebsiteData(response.data.website),
        chatAnalysis: response.data.chatAnalysis,
      };
    } catch (error) {
      console.error("Error adding website with chat:", error);
      throw error;
    }
  }

  // Get AI analysis for a website
  async getChatAnalysis(
    websiteName: string,
    websiteUrl: string
  ): Promise<ChatResponse> {
    try {
      const request: ChatRequest = {
        websiteName,
        websiteUrl,
      };

      const response = await axios.post<ChatResponse>(
        `${API_BASE_URL}/Chat/getResponse`,
        request
      );

      return response.data;
    } catch (error) {
      console.error("Error getting chat analysis:", error);
      throw error;
    }
  }

  // Analyze changes between website versions
  async analyzeChanges(
    websiteName: string,
    websiteUrl: string,
    differences: string
  ): Promise<ChatResponse> {
    try {
      const request: ChangeAnalysisRequest = {
        websiteName,
        websiteUrl,
        differences,
      };

      const response = await axios.post<ChatResponse>(
        `${API_BASE_URL}/Chat/analyzeChanges`,
        request
      );

      return response.data;
    } catch (error) {
      console.error("Error analyzing website changes:", error);
      throw error;
    }
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
      // Use the existing allWebsites endpoint which already checks for changes
      const response = await axios.get<TrackedWebsite[]>(
        `${API_BASE_URL}/Website/allWebsites`
      );
      return response.data.map((website) => this.transformWebsiteData(website));
    } catch (error) {
      console.error("Error checking for changes:", error);
      throw error;
    }
  }

  // Helper method to transform API data to our application format
  private transformWebsiteData(website: TrackedWebsite): TrackedWebsite {
    return {
      ...website,
      // Add name property if it doesn't exist (derived from URL)
      name: website.name || this.extractNameFromUrl(website.url),
      // Map contentChanged to hasChanges for consistency with frontend
      hasChanges:
        website.hasChanges !== undefined
          ? website.hasChanges
          : website.contentChanged !== undefined
          ? website.contentChanged
          : false,
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
