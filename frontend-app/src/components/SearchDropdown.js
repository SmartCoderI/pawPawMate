import React, { useEffect, useRef } from 'react';
import './SearchDropdown.css';

const SearchDropdown = ({ 
  results, 
  loading, 
  onSelect, 
  onClose, 
  selectedIndex, 
  onKeyNavigation,
  searchQuery 
}) => {
  const dropdownRef = useRef(null);
  const itemRefs = useRef([]);

  // Result type configurations
  const resultTypes = {
    city: { icon: '🏙️', label: 'City', color: '#3b82f6' },
    address: { icon: '📍', label: 'Address', color: '#6b7280' },
    vet: { icon: '🏥', label: 'Veterinary', color: '#53f2fc' },
    pet_store: { icon: '🏪', label: 'Pet Store', color: '#FFE500' },
    dog_park: { icon: '🐕', label: 'Dog Park', color: '#B8FF9F' },
    shelter: { icon: '🏠', label: 'Shelter', color: '#FFC29F' }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        onKeyNavigation('down');
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        onKeyNavigation('up');
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          onSelect(results[selectedIndex]);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, results, onKeyNavigation, onSelect, onClose]);

  const handleItemClick = (result) => {
    onSelect(result);
  };

  // Group results by type
  const groupedResults = results.reduce((groups, result) => {
    const type = result.type || 'address';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(result);
    return groups;
  }, {});

  // Order of result types to display
  const typeOrder = ['city', 'address', 'dog_park', 'vet', 'pet_store', 'shelter'];

  if (!results.length && !loading) {
    return (
      <div ref={dropdownRef} className="search-dropdown">
        <div className="search-dropdown-content">
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <div className="no-results-text">
              No results found for "{searchQuery}"
            </div>
            <div className="no-results-suggestion">
              Try searching for cities, addresses, or pet-related places
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="search-dropdown">
      <div className="search-dropdown-content">
        {loading && (
          <div className="search-loading">
            <div className="loading-spinner">⟳</div>
            <span>{results.length > 0 ? 'Finding more results...' : 'Searching...'}</span>
          </div>
        )}
        
        {results.length > 0 && (
          <div className="search-results">
            {typeOrder.map(type => {
              const typeResults = groupedResults[type];
              if (!typeResults || typeResults.length === 0) return null;

              const typeConfig = resultTypes[type];
              
              return (
                <div key={type} className="result-group">
                  <div className="result-group-header">
                    <span className="result-group-icon">{typeConfig.icon}</span>
                    <span className="result-group-label">{typeConfig.label}</span>
                  </div>
                  
                  {typeResults.map((result, index) => {
                    const globalIndex = results.findIndex(r => r.id === result.id);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <div
                        key={result.id}
                        ref={el => itemRefs.current[globalIndex] = el}
                        className={`search-result-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleItemClick(result)}
                        style={{
                          '--type-color': typeConfig.color
                        }}
                      >
                        <div className="result-icon">
                          {typeConfig.icon}
                        </div>
                        <div className="result-content">
                          <div className="result-name">
                            {highlightMatch(result.name, searchQuery)}
                          </div>
                          {result.address && (
                            <div className="result-address">
                              {formatAddress(result.address)}
                            </div>
                          )}
                        </div>
                        <div className="result-type-badge">
                          {typeConfig.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Highlight matching text in search results
const highlightMatch = (text, query) => {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <span key={index} className="search-highlight">{part}</span>
    ) : (
      part
    )
  );
};

// Format address from Nominatim address object
const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [];
  
  // Add house number and street
  if (address.house_number && address.road) {
    parts.push(`${address.house_number} ${address.road}`);
  } else if (address.road) {
    parts.push(address.road);
  }
  
  // Add city
  const city = address.city || address.town || address.village || address.hamlet;
  if (city) {
    parts.push(city);
  }
  
  // Add state
  if (address.state) {
    parts.push(address.state);
  }
  
  return parts.join(', ');
};

export default SearchDropdown; 