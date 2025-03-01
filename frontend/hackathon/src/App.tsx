import React, { useState, useEffect } from 'react';
import { Flag, Plus, Save, Trash } from 'lucide-react';
import websiteApi, { TrackedWebsite } from './api'; // Import the API service

// SiteCard Component
const SiteCard: React.FC<{
  site: TrackedWebsite;
  onNameChange: (id: number, name: string) => void;
  onUrlChange: (id: number, url: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onSave: (site: TrackedWebsite) => void;
  onDelete?: (id: number) => void;
  isSaving: boolean;
}> = ({ site, onNameChange, onUrlChange, onMouseEnter, onMouseLeave, onSave, onDelete, isSaving }) => {
  const isNewSite = site.id < 0; // Negative IDs are temporary

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
          value={site.name || ""}
          onChange={(e) => onNameChange(site.id, e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter site name"
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
          placeholder="https://example.com"
        />
      </div>

      <div className="flex justify-between items-center">
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

        {isNewSite && (
          <div className="flex space-x-2">
            <button
              onClick={() => onSave(site)}
              disabled={isSaving || !site.url}
              className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save website"
            >
              <Save size={16} />
            </button>

            {onDelete && (
              <button
                onClick={() => onDelete(site.id)}
                className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Delete website"
              >
                <Trash size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// SiteDetail Component
const SiteDetail: React.FC<{ site: TrackedWebsite | null }> = ({ site }) => {
  if (!site) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Website Monitor
        </h2>
        <p className="text-gray-600 mb-6">
          Hover over a site from the list to view details
        </p>
        <div className="p-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No site selected</p>
        </div>
      </div>
    );
  }

  const isNewSite = site.id < 0;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Website Monitor
      </h2>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">{site.name || "New Website"}</h3>
        <div className="mb-4">
          <p className="text-gray-700 font-medium">URL:</p>
          {site.url ? (
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {site.url}
            </a>
          ) : (
            <span className="text-gray-500">No URL specified</span>
          )}
        </div>
        {!isNewSite && (
          <>
            <div className="mb-4">
              <p className="text-gray-700 font-medium">Last Checked:</p>
              <p className="text-gray-600">
                {new Date(site.lastChecked).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center">
              <Flag
                color={site.hasChanges ? "red" : "gray"}
                size={24}
                className="mr-2"
              />
              <span
                className={`font-medium ${site.hasChanges ? "text-red-600" : "text-gray-600"}`}
              >
                {site.hasChanges
                  ? "Changes have been detected on this site"
                  : "No changes detected on this site"}
              </span>
            </div>
          </>
        )}
        {isNewSite && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded border border-blue-200">
            <p className="text-sm">
              Enter a valid URL and click the save button to start tracking this website.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [sites, setSites] = useState<TrackedWebsite[]>([]);
  const [hoveredSite, setHoveredSite] = useState<TrackedWebsite | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all websites on component mount
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoading(true);
        const data = await websiteApi.getAllWebsites();
        setSites(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch websites:", err);
        setError("Failed to load websites. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  const handleNameChange = (id: number, newName: string) => {
    setSites(
      sites.map((site) => (site.id === id ? { ...site, name: newName } : site))
    );
  };

  const handleUrlChange = (id: number, newUrl: string) => {
    setSites(
      sites.map((site) => (site.id === id ? { ...site, url: newUrl } : site))
    );
  };

  const saveWebsite = async (site: TrackedWebsite) => {
    if (!site.url) {
      setError("URL is required");
      return;
    }

    try {
      setSaving(true);
      const savedSite = await websiteApi.addWebsite(site.url);

      // Replace the temporary site with the saved one
      setSites(prevSites =>
        prevSites.map(s => s.id === site.id ? savedSite : s)
      );

      // Update hovered site if it was the one we just saved
      if (hoveredSite && hoveredSite.id === site.id) {
        setHoveredSite(savedSite);
      }

      setError(null);
    } catch (err) {
      console.error("Failed to save website:", err);
      setError("Failed to save the website. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteUnsavedWebsite = (id: number) => {
    setSites(prevSites => prevSites.filter(site => site.id !== id));
    if (hoveredSite && hoveredSite.id === id) {
      setHoveredSite(null);
    }
  };

  const checkForChanges = async () => {
    try {
      setLoading(true);
      const updatedSites = await websiteApi.checkForChanges();
      setSites(updatedSites);
      setError(null);
    } catch (err) {
      console.error("Failed to check for changes:", err);
      setError("Failed to check for changes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const addNewWebsite = () => {
    // Create a temporary website in the UI
    const tempId = -Date.now(); // Use negative timestamp as temporary ID
    const newWebsite: TrackedWebsite = {
      id: tempId,
      url: '',
      name: '',
      lastChecked: new Date().toISOString(),
      lastHash: '',
      hasChanges: false
    };

    // Add the new website to the beginning of the sites array
    setSites([newWebsite, ...sites]);
    setHoveredSite(newWebsite);
  };

  return (
    <div className="flex h-screen w-full">
      <div className="w-1/2 overflow-y-auto p-6 bg-gray-800 border-r border-gray-700">
        <h1 className="text-3xl font-bold mb-4 text-white">Your Sites</h1>

        <div className="flex space-x-3 mb-6">
          <button
            onClick={checkForChanges}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Check for Changes'}
          </button>

          <button
            onClick={addNewWebsite}
            disabled={loading || saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Plus size={20} color="white" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading && sites.length === 0 ? (
          <div className="flex justify-center p-8">
            <p className="text-white">Loading sites...</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <p className="text-white mb-2">No websites found</p>
            <p className="text-gray-400 text-sm">Click the + button to add a website</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onNameChange={handleNameChange}
                onUrlChange={handleUrlChange}
                onMouseEnter={() => setHoveredSite(site)}
                onMouseLeave={() => setHoveredSite(null)}
                onSave={saveWebsite}
                onDelete={site.id < 0 ? deleteUnsavedWebsite : undefined}
                isSaving={saving}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <SiteDetail site={hoveredSite} />
      </div>
    </div>
  );
};

export default App;