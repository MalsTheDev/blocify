import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import spotifyLogo from '/spotify_logo.png'

function ArtistList({ artists, size, fontSize }) {
  const getSizeClass = () => {
    switch (size) {
      case '50%':
        return 'w-[40rem]';
      case '33.333%':
        return 'w-[26.6666rem]';
      case '20%':
        return 'w-[16rem]';
      case '10%':
        return 'w-[10rem]';
      case '5%':
        return 'w-[5rem]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="flex justify-center">
      {artists.map((artist, index) => (
        <a key={index} href={artist.external_urls.spotify} className={`${getSizeClass()} group relative`}>
        <img src={artist.images[0].url} alt="" className="w-full h-full object-cover" />
        <div className={`flex font-bold text-${fontSize} opacity-0 absolute inset-0 items-center justify-center bg-black bg-opacity-75 text-white text-center transition-all`}>
            {size == '50%' ? index + 1 : size == '33.333%' ? index + 3 : size == '20%' ? index + 5 + 1 : ''}. {artist.name}
        </div>
        </a>
      ))}
    </div>
  );
}

function TracksList({ topTracks }) {
  return (
    <div className='flex flex-col text-center text-white my-5 xl:my-12'>
      <h1 className='text-4xl font-semibold m-2'>Your top tracks:</h1>
      {topTracks.map((track, index) => {
        return (
          <a key={track.name} href={track.external_urls.spotify} className='text-2xl underline underline-offset-2 my-1 xl:text-4xl hover:scale-105 transition-all'>{index + 1}. {track.name}</a>
        )
      })}
    </div>
  )
}

function App() {
  const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = 'http://blocify.vercel.app';
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
  const RESPONSE_TYPE = 'token';

  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');

    if(token) {
      window.localStorage.removeItem('token')
    }

    if (!token && hash) {
      token = hash.substring(1).split('&').find((elem) => elem.startsWith('access_token')).split('=')[1];

      window.location.hash = '';
      window.localStorage.setItem('token', token);
    }

    setToken(token);
  }, []);


  const logout = () => {
    setToken('');
    window.localStorage.removeItem('token');
    window.location.reload(false);
  };

  const [topArtists, setTopArtists] = useState([]);
  const [from, setFrom] = useState('');
  const [topSongs, setTopSongs] = useState([])

  const getTopArtists = async (e) => {
    e.preventDefault();
    if (token) {
      const { data } = await axios.get(`https://api.spotify.com/v1/me/top/artists?time_range=${from}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const { data: songsData } = await axios.get(`https://api.spotify.com/v1/me/top/tracks?time_range=${from}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setTopArtists(data.items);
      setTopSongs(songsData.items);
    }
  };

  return (
    <div className="bg-black min-h-screen my-0">
      <ToastContainer />
      <h1 className="text-5xl font-bold mt-10 text-center text-white font-mono">BlocIFY!</h1>
      <p className="text-sm text-gray-500 font-thin text-center">
        Made by <a href="https://malsthedev.vercel.app" className="font-bold underline">Mals</a> :)
      </p>
      <img src={spotifyLogo} alt="" className='h-16 w-auto mx-auto my-5' />
      <div className="flex items-center justify-center m-5">
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-top-read`}
            className="text-2xl border-2 text-green-400 border-green-400 px-2 py-1 rounded-xl hover:text-white hover:bg-green-500 transition-all"
          >
            Login to Spotify
          </a>
        ) : (
          <button onClick={logout} className="text-xl border-2 border-green-400 text-green-400 px-2 py-1 rounded-xl hover:text-white hover:bg-green-500 transition-all">
            Logout
          </button>
        )}
      </div>
      <div className={`${token ? 'block' : 'hidden'}`}>
        <h1 className='text-xl font-bold text-center my-5 text-white'>Select time period:</h1>
        <div className='flex items-center space-x-5 justify-center mb-5'>
          <button onClick={(e) => {
              setFrom('long_term')
              getTopArtists(e)
            }} className={`${from == 'long_term' ? 'bg-green-700' : 'bg-green-500'} text-xl p-2 text-white rounded-xl hover:bg-green-700 transition-all`}>All time</button>
          <button onClick={(e) => {
              setFrom('medium_term')
              getTopArtists(e)
            }} className={`${from == 'medium_term' ? 'bg-green-700' : 'bg-green-500'} text-xl p-2 text-white rounded-xl hover:bg-green-700 transition-all`}>6 months</button>
          <button onClick={(e) => {
              setFrom('short_term')
              getTopArtists(e)
            }} className={`${from == 'short_term' ? 'bg-green-700': 'bg-green-500'} text-xl p-2 text-white rounded-xl hover:bg-green-700 transition-all`}>Last month</button>
        </div>
      </div>
      <div className={`flex-col max-w-[768px] justify-center w-[90vw] mx-auto md:w-1/2 my-10 p-5 ${topArtists.length > 0 ? 'flex' : 'hidden'} rounded-3xl bg-green-500`}>
        <h1 className='text-2xl text-center mb-5 text-white'>Your top artists:</h1>
        <div className='m-2 md:m-5'>
          <ArtistList artists={topArtists.slice(0, 2)} size="50%" fontSize={'text-lg md:text-xl'} />
          <ArtistList artists={topArtists.slice(2, 5)} size="33.333%" fontSize={'md:text-lg'} />
          <ArtistList artists={topArtists.slice(5, 10)} size="20%" fontSize={'sm md:text-md'} />
        </div>
        <TracksList topTracks={topSongs} />
      </div>
    </div>
  );
}

export default App;
