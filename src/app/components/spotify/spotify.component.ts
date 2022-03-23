import { Token } from '@angular/compiler/src/ml_parser/tokens';
import * as $ from "jquery";
import SpotifyWebApi from 'spotify-web-api-js';
import { NONE_TYPE } from '@angular/compiler';
import { Component, HostListener, Input, OnInit, Output, EventEmitter } from '@angular/core';

declare var require: any;
/*Accès à l'api Spotify JS*/
const Spotify = require('spotify-web-api-js');
let spotify = new SpotifyWebApi();

@Component({
  selector: 'app-spotify',
  templateUrl: './spotify.component.html',
  styleUrls: ['./spotify.component.css']
})
export class SpotifyComponent implements OnInit {
  @Input() token:string;

  constructor() {
    this.token = "";
  }

  ngOnInit(): void {
    console.log("SPOTIFY-COMPONENT Token = " + this.token);
    spotify.setAccessToken(this.token);
    spotify.getMe().then(function(data) {
    })
    .catch(function(err){
      console.log('Something went wrong:', err.message);
    });
  }

  /**
   * Permet de se connecter à l'API Spotify
   */
  loginSpotify(): void{
    // Fonction qui permet d'extraite le token client de l'URL du Site
    const getUrlParameter = (sParam: any) => {
      let sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL != undefined && sPageURL.length > 0 ? sPageURL.split('#') : [],
      sParameterName,
      i;
      let split_str = window.location.href.length > 0 ? window.location.href.split('#') : [];
      sURLVariables = split_str != undefined && split_str.length > 1 && split_str[1].length > 0 ? split_str[1].split('&') : [];
      for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
      }
      return null;
      };

      // Le token d'accès est stocké dans cette variable
      let accessToken = getUrlParameter('access_token');
      /* BLOC CONNEXION */
      let client_id = '9231b9552fe24c8d94e2f5ed995bac83';
      /* URL du site pour la redirection après connexion (lien à encoder via le site ci-dessous) :
      https://www.url-encode-decode.com/ */
      let redirect_uri = 'https%3A%2F%2Fjulienmah.github.io%2FSave1%2F';
      const redirect = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&redirect_uri=${redirect_uri}`;
      if(accessToken == null || accessToken == "" || accessToken == undefined){
        window.location.replace(redirect);
      }
      /* On stock dans la variable d'instance du composant accueil le Token de connexion */
      this.token = accessToken!.toString();
      console.log("Le token d'accès est : " + this.token);
  }


  /**
   * Permet de chercher un nombre de "max_songs" correspondant à la recherche de
   * l'utilisateur et de lui permettre de jouer ces sons
   */
  chercherSons(): void{
    let raw_search_query = $('#son').val();
    raw_search_query = raw_search_query!.toString();
    let search_query = encodeURI(raw_search_query);
    $.ajax({
      url: `https://api.spotify.com/v1/search?q=${search_query}&type=track`,
      type: 'GET',
      headers: {
          'Authorization' : 'Bearer ' + this.token
      },
      success: function(data) {
        let num_of_tracks = data.tracks.items.length;
        let count = 0;
        const max_songs = 8;
        while(count < max_songs && count < num_of_tracks){
          let id = data.tracks.items[count].id;

          /* AJOUT */
          spotify.getTrack(id).then(
            function (data) {
              console.log(data);
            },
            function (err) {
              console.error(err);
            }
          );

          let src_str = `https://open.spotify.com/embed/track/${id}`;
          let iframe = `<div class='song'><iframe src=${src_str} frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe></div>`;
          let parent_div = $('#song_'+ count);
          parent_div.html(iframe);
          count++;
        }
      }
    });
  }

}
