import React, { useState, useEffect } from 'react';
import { Flag } from 'lucide-react';

// Types
interface SiteData {
  id: string;
  url: string;
  name: string;
  hasChanges: boolean;
}

// SiteCard Component
const SiteCard: React.FC<{
  site: SiteData;
  onNameChange: (id: string, name: string) => void;
  onUrlChange: (id: string, url: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ site, onNameChange, onUrlChange, onMouseEnter, onMouseLeave }) => {
  return (
    <div
      className="bg-gray-900 rounded-lg shadow-md p-4 transition-all hover:shadow-lg mb-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Site Name
        </label>
        <input
          type="text"
          value={site.name}
          onChange={(e) => onNameChange(site.id, e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          URL
        </label>
        <input
          type="url"
          value={site.url}
          onChange={(e) => onUrlChange(site.id, e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <Flag
          color={site.hasChanges ? "red" : "white"}
          size={20}
          className="mr-2"
        />
        <span className="text-sm text-gray-300">
          {site.hasChanges ? "Changes detected" : "No changes"}
        </span>
      </div>
    </div>
  );
};

// SiteDetail Component
const SiteDetail: React.FC<{ site: SiteData | null }> = ({ site }) => {
  if (!site) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Website Monitor</h2>
        <p className="text-gray-600 mb-6">Hover over a site from the list to view details</p>
        <div className="p-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No site selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Website Monitor</h2>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">{site.name}</h3>
        <div className="mb-4">
          <p className="text-gray-700 font-medium">URL:</p>
          <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {site.url}
          </a>
        </div>
        <div className="flex items-center">
          <Flag
            color={site.hasChanges ? "red" : "gray"}
            size={24}
            className="mr-2"
          />
          <span className={`font-medium ${site.hasChanges ? "text-red-600" : "text-gray-600"}`}>
            {site.hasChanges ? "Changes have been detected on this site" : "No changes detected on this site"}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [sites, setSites] = useState<SiteData[]>([]);
  const [hoveredSite, setHoveredSite] = useState<SiteData | null>(null);

  // Simulate fetching data from backend
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchData = async () => {
      // Simulated API response
      const data: SiteData[] = [
        { id: '1', url: 'https://example.com', name: 'Example Site', hasChanges: true },
        { id: '2', url: 'https://test.com', name: 'Test Website', hasChanges: false },
        { id: '3', url: 'https://mysite.org', name: 'My Organization', hasChanges: true },
        { id: '4', url: 'https://blog.dev', name: 'Dev Blog', hasChanges: false },
        { id: '5', url: 'https://docs.tech', name: 'Documentation', hasChanges: false },
      ];
      setSites(data);
    };

    fetchData();
  }, []);

  const handleNameChange = (id: string, newName: string) => {
    setSites(sites.map(site =>
      site.id === id ? { ...site, name: newName } : site
    ));
  };

  const handleUrlChange = (id: string, newUrl: string) => {
    setSites(sites.map(site =>
      site.id === id ? { ...site, url: newUrl } : site
    ));
  };

  const checkForChanges = () => {
    // This would typically make an API call to check for changes
    console.log("Checking for changes...");
    // Simulate some sites changing
    const updatedSites = sites.map(site => ({
      ...site,
      hasChanges: Math.random() > 0.5
    }));
    setSites(updatedSites);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 overflow-y-auto p-6 bg-gray-800 border-r border-gray-700">
        <h1 className="text-3xl font-bold mb-4 text-white">Your Sites</h1>

        <button
          onClick={checkForChanges}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Check for Changes
        </button>

        <div className="space-y-2">
          {sites.map(site => (
            <SiteCard
              key={site.id}
              site={site}
              onNameChange={handleNameChange}
              onUrlChange={handleUrlChange}
              onMouseEnter={() => setHoveredSite(site)}
              onMouseLeave={() => setHoveredSite(null)}
            />
          ))}
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <SiteDetail site={hoveredSite} />
      </div>
    </div>
  );
};

export default App;