import axios from 'axios';

// Type definitions
export interface TrackedWebsite {
    id: number;
    url: string;
    lastChecked: string;
    lastHash: string;
    name?: string;
    hasChanges?: boolean;
}

export interface WebsiteRequest {
    url: string;
    content: string;
}

// Base API URL - should be configured based on your environment
const API_BASE_URL = 'http://localhost:5173/api/';

// API service class
class WebsiteApiService {
    // Get a specific website by ID
    async getWebsiteById(id: number): Promise<TrackedWebsite> {
        try {
            const response = await axios.get<TrackedWebsite>(`${API_BASE_URL}/Website/website?id=${id}`);
            return this.transformWebsiteData(response.data);
        } catch (error) {
            console.error('Error fetching website:', error);
            throw error;
        }
    }

    // Get all websites
    async getAllWebsites(): Promise<TrackedWebsite[]> {
        try {
            const response = await axios.get<TrackedWebsite[]>(`${API_BASE_URL}/WebsiteController/allWebsites`);
            console.log(response.data);
            return response.data.map(website => this.transformWebsiteData(website));
        } catch (error) {
            console.error('Error fetching all websites:', error);
            throw error;
        }
    }

    // Add a new website
    async addWebsite(url: string, content: string): Promise<TrackedWebsite> {
        try {
            const request: WebsiteRequest = {
                url,
                content
            };

            const response = await axios.post<WebsiteRequest>(
                `${API_BASE_URL}/Website/addWebsite`,
                request
            );

            // The API returns the request, not the created entity
            // In a real-world scenario, you might want to fetch the created entity
            return {
                id: -1, // Placeholder since the API doesn't return the ID
                url: response.data.url,
                lastChecked: new Date().toISOString(),
                lastHash: response.data.content,
                name: this.extractNameFromUrl(response.data.url),
                hasChanges: false
            };
        } catch (error) {
            console.error('Error adding website:', error);
            throw error;
        }
    }

    // Helper to check for website changes (this would need to be implemented on the backend)
    async checkForChanges(): Promise<TrackedWebsite[]> {
        // In a real implementation, you'd have an endpoint for checking changes
        // For now, we'll just fetch all websites and simulate changes
        const websites = await this.getAllWebsites();
        return websites;
    }

    // Helper method to transform API data to our application format
    private transformWebsiteData(website: TrackedWebsite): TrackedWebsite {
        return {
            ...website,
            // Add name property if it doesn't exist (derived from URL)
            name: website.name || this.extractNameFromUrl(website.url),
            // Add hasChanges property (this would typically come from the backend)
            hasChanges: website.hasChanges !== undefined ?
                website.hasChanges :
                Math.random() > 0.5 // Simulate changes for demo
        };
    }

    // Helper method to extract a name from URL
    private extractNameFromUrl(url: string): string {
        try {
            const hostname = new URL(url).hostname;
            return hostname
                .replace('www.', '')
                .split('.')
                .slice(0, -1)
                .join('.')
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        } catch {
            return url;
        }
    }
}

// Export a singleton instance
export const websiteApi = new WebsiteApiService();
export default websiteApi;