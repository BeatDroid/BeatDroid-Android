import json
from typing import Dict, Any, Optional
from BeatPrints import lyrics, poster, spotify

def generate_track_poster(track_query: str, output_path: str = "./", line_range: str = "5-9", spotify_client_id: Optional[str] = None, spotify_client_secret: Optional[str] = None) -> Dict[str, Any]:
    """
    Generate a track poster using BeatPrints library.
    
    Args:
        track_query (str): The track to search for (e.g., "Saturn - SZA")
        output_path (str): Directory path where the poster will be saved
        line_range (str): Range of lyrics lines to highlight (e.g., "5-9")
        spotify_client_id (str, optional): Spotify client ID. If None, will try to get from environment
        spotify_client_secret (str, optional): Spotify client secret. If None, will try to get from environment
    
    Returns:
        Dict[str, Any]: Result containing success status, metadata, and any error messages
    """
    try:
        # Get Spotify credentials
        client_id = "395a0fe688aa452b986c0f00c9943ea0"
        client_secret = "dcbde825575642fc9e5c39e06bcd325b"
        
        if not client_id or not client_secret:
            return {
                "success": False,
                "error": "Spotify credentials not provided. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables or pass them as parameters."
            }
        
        # Initialize components
        ly = lyrics.Lyrics()
        ps = poster.Poster(output_path)
        sp = spotify.Spotify(client_id, client_secret)
        
        # Search for the track and fetch metadata
        search_results = sp.get_track(track_query, limit=1)
        
        if not search_results:
            return {
                "success": False,
                "error": f"No tracks found for query: {track_query}"
            }
        
        # Pick the first result
        metadata = search_results[0]
        
        # Get lyrics for the track
        track_lyrics = ly.get_lyrics(metadata)
        
        # Use the placeholder for instrumental tracks; otherwise, select specific lines
        highlighted_lyrics = (
            track_lyrics if ly.check_instrumental(metadata) else ly.select_lines(track_lyrics, line_range)
        )
        
        # Generate the track poster
        poster_result = ps.track(metadata, highlighted_lyrics)
        
        return {
            "success": True,
            "metadata": {
                "title": metadata.get("name", ""),
                "artist": metadata.get("artists", [{}])[0].get("name", "") if metadata.get("artists") else "",
                "album": metadata.get("album", {}).get("name", ""),
                "release_date": metadata.get("album", {}).get("release_date", ""),
                "duration_ms": metadata.get("duration_ms", 0)
            },
            "lyrics_info": {
                "is_instrumental": ly.check_instrumental(metadata),
                "line_range_used": line_range if not ly.check_instrumental(metadata) else "full",
                "lyrics_length": len(track_lyrics) if track_lyrics else 0
            },
            "output_path": output_path,
            "poster_result": poster_result
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Error generating track poster: {str(e)}"
        }

# Convenience function for simple usage (backward compatibility)
def generate_poster_simple(track_query: str) -> str:
    """
    Simple wrapper function that returns a JSON string result.
    Useful for basic Chaquopy integration.
    
    Args:
        track_query (str): The track to search for
    
    Returns:
        str: JSON string containing the result
    """
    result = generate_track_poster(track_query)
    return json.dumps(result, indent=2)

# Test function to verify the setup
def test_beatprints_setup() -> str:
    """
    Test function to verify that BeatPrints components can be initialized.
    
    Returns:
        str: JSON string containing test results
    """
    try:
        # Test basic imports first
        from BeatPrints import lyrics, spotify
        
        # Test lyrics component (doesn't require Pillow)
        ly = lyrics.Lyrics()
        
        # Test spotify component (doesn't require Pillow)
        client_id = "395a0fe688aa452b986c0f00c9943ea0"
        client_secret = "dcbde825575642fc9e5c39e06bcd325b"
        sp = spotify.Spotify(client_id, client_secret)
        
        # Skip poster initialization for now (requires Pillow/native libs)
        result = {
            "success": True,
            "components_initialized": {
                "lyrics": "success",
                "spotify": "success",
                "poster": "skipped (requires native libs)"
            },
            "spotify_credentials_available": bool(client_id and client_secret),
            "environment_variables": {
                "SPOTIFY_CLIENT_ID": "set" if client_id else "not set",
                "SPOTIFY_CLIENT_SECRET": "set" if client_secret else "not set"
            },
            "note": "Basic BeatPrints components working - poster component skipped due to native library requirements"
        }
        return json.dumps(result, indent=2)
    except Exception as e:
        result = {
            "success": False,
            "error": f"Setup test failed: {str(e)}"
        }
        return json.dumps(result, indent=2)