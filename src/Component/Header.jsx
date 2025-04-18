import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo/logo.png";
import { HiDotsVertical, HiHome, HiPlus, HiStar } from 'react-icons/hi';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import HeaderItem from './HeaderItem';
import GlobalApi from '../Services/GlobalApi'; // Adjust path if needed

function Header() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [menu, setMenu] = useState([
    {
      name: "Home",
      icon: HiHome,
      path: "/",
    },
    {
      name: "search",
      icon: HiMagnifyingGlass,
      onClick: () => setShowSearchInput(true),
    },
    {
      name: "watch list",
      icon: HiPlus,
      path: "/watchlist",
    },
    {
      name: "original",
      icon: HiStar,
      path: "/original",
    },
    {
      name: "genre",
      icon: HiStar,
      path: "/genre/all/page/1",
    },
    {
      name: "another",
      icon: HiStar,
      path: "/another",
    },
  ]);
  const [togle, setTogle] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
      setTogle(false);
      setShowSearchInput(false);
      setSuggestions([]);
      setSearchTerm('');
    }
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?query=${query}`);
      setShowSearchInput(false);
      setSuggestions([]);
      setSearchTerm('');
    }
  };

  const closeSearchInput = () => {
    setShowSearchInput(false);
    setSuggestions([]);
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    if (newSearchTerm.trim() && newSearchTerm.length > 2) {
      fetchSearchSuggestions(newSearchTerm);
    } else {
      setSuggestions([]);
    }
  };

  const fetchSearchSuggestions = async (query) => {
    setIsFetchingSuggestions(true);
    try {
      const data = await GlobalApi.searchMovies(query);
      if (data && data.results) {
        setSuggestions(data.results.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleSuggestionClick = (movie) => {
    navigate(`/${movie.media_type}/${movie.id}`);
    setShowSearchInput(false);
    setSuggestions([]);
    setSearchTerm('');
  };

  return (
    <>
      {/* Large screen */}
      <div className="hidden z-20 bg-black/30 md:flex gap-3 items-center w-full h-[50px] justify-between ">
        {/* Header Logo */}
        <div onClick={() => handleNavigation("/")} className="cursor-pointer">
          <img
            className='w-[80px] h-[50px] object-contain cursor-pointer '
            src={logo} alt="" />
          <span className='text-blue-500 absolute top-8 px-4 text-sm'>EnjOy</span>
        </div>

        <div className="gap-5 items-center flex px-6 relative">
          {menu.map((item, index) => (
            <div key={index} onClick={item.onClick ? item.onClick : () => handleNavigation(item.path)} className="cursor-pointer">
              <HeaderItem name={item.name === 'search' && showSearchInput ? '' : item.name} Icon={item.icon} />
            </div>
          ))}
          {showSearchInput && (
            <div className="flex items-center ml-4">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search movies..."
                className="bg-gray-800 text-white rounded-md py-1 px-2 focus:outline-none"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
              />
              <HiMagnifyingGlass onClick={() => handleSearch(searchTerm)} className="text-white cursor-pointer ml-2" />
              <HiXMark onClick={closeSearchInput} className="text-white cursor-pointer ml-2" />
            </div>
          )}
          {suggestions.length > 0 && showSearchInput && (
            <ul className="absolute top-full left-0 bg-gray-800 text-white rounded-md shadow-lg mt-1 w-full z-30">
              {suggestions.map((movie) => (
                <li
                  key={movie.id}
                  className="py-2 px-4 cursor-pointer hover:bg-gray-700"
                  onClick={() => handleSuggestionClick(movie)}
                >
                  {movie.title || movie.name}
                </li>
              ))}
            </ul>
          )}
          {isFetchingSuggestions && showSearchInput && suggestions.length === 0 && (
            <div className="absolute top-full left-0 bg-gray-800 text-white rounded-md shadow-lg mt-1 w-full z-30 py-2 px-4">
              Searching...
            </div>
          )}
        </div>
      </div>

      {/* Small screen */}
      <div className="w-full absolute z-20 bg-black/30 md:hidden flex gap-10 items-center relative">
        <div onClick={() => handleNavigation("/")} className="cursor-pointer">
          <img
            className='w-[80px] h-[50px] object-contain cursor-pointer '
            src={logo} alt="" />
          <span className='text-blue-500 absolute top-6 px-3 text-[9px]'>EnjOy</span>
        </div>

        <div className="flex gap-6 items-center w-full" onClick={() => setTogle(!togle)}>
          {menu.map((item, index) => index < 4 && (
            <div key={index} onClick={item.onClick ? item.onClick : () => handleNavigation(item.path)} className="cursor-pointer">
              <HeaderItem name={item.name === 'search' && showSearchInput ? '' : ""} Icon={item.icon} />
            </div>
          ))}
          <div className="md:hidden relative">
            <HeaderItem name={""} Icon={HiDotsVertical} />
            {togle ?
              <div className="absolute mt-2 bg-gray-400 rounded-lg px-4 mr-[10px] text-black pb-4" >
                {menu.map((item, index) => index > 3 && (
                  <div key={index} onClick={() => handleNavigation(item.path)} className="cursor-pointer">
                    <HeaderItem name={item.name} Icon={item.icon} />
                  </div>
                ))}
              </div>
              : null}
          </div>
          {showSearchInput && (
            <div className="absolute top-full left-0 bg-black/80 w-full p-4 flex flex-col items-start">
              <div className="flex items-center w-full mb-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search movies..."
                  className="bg-gray-800 text-white rounded-md py-1 px-2 focus:outline-none w-full"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                />
                <HiMagnifyingGlass onClick={() => handleSearch(searchTerm)} className="text-white cursor-pointer ml-2" />
                <HiXMark onClick={closeSearchInput} className="text-white cursor-pointer ml-2" />
              </div>
              {suggestions.length > 0 && (
                <ul className="bg-gray-800 text-white rounded-md shadow-lg w-full">
                  {suggestions.map((movie) => (
                    <li
                      key={movie.id}
                      className="py-2 px-4 cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSuggestionClick(movie)}
                    >
                      {movie.title || movie.name}
                    </li>
                  ))}
                </ul>
              )}
              {isFetchingSuggestions && suggestions.length === 0 && (
                <div className="bg-gray-800 text-white rounded-md shadow-lg w-full py-2 px-4">
                  Searching...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;