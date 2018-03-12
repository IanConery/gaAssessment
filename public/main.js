function moreInfo(el){
  const imdbID = $(el).attr('id');
  $.ajax({
      url: 'http://localhost:3000/fullDescription',
      data: {movieId: imdbID},
      success: (result)=>{
        $('#more-info .modal-body').append(`<ul><li><div>${result.Title}</div></li><li>Rating: ${result.Rated}</li><li>Actors: ${result.Actors}</li><li>Director: ${result.Director}</li><li>Plot: ${result.Plot}</li></ul>`);
        $('#more-info').toggle();
      }
    });
};

function addToFavs(el){
  const imdbID = $(el).parent().parent().parent().attr('id');
  const titleEL = $(el).parent().parent().parent().find('.title');
  const title = $(titleEL).html();
  $(el).hide();
  $.ajax({
    type: 'POST',
    url: 'http://localhost:3000/addToFavorites',
    data: {title, imdbID},
  });
};

$(document).ready(()=>{

  $('#find-movies').on('click',()=>{
    const text = $('#input-box').val();
    $('.spinner-box').toggle();
    $.ajax({
      url: 'http://localhost:3000/search',
      data: {queryString: text},
      success: (result)=>{
        if(result && result.length > 0){
          result.forEach((movie)=>{
            $('#main-content').append(`<li id="${movie.imdbID}" class="list-group-item container movie-info" onClick="moreInfo(this)"><div class="row"><div class="text-left col-sm-6 title">${movie.Title}</div><div class="text-right col-sm-4">${movie.Year}</div><div class="col-sm-2"><button id="fav-${movie.imdbID}" class="btn btn-outline-secondary" data-toggle='modal' onClick="addToFavs(this)">Favorite</button></div></div></li>`);
            $(`#fav-${movie.imdbID}`).on('click',(e)=>{e.stopPropagation()});
          });
        }else{
          $('#main-content').append('<div>Hmm... it appears that nothing matches your search terms</div>')
        }
        $('.spinner-box').toggle();
      }
    });
  });

  $('.favorite').on('click', ()=>{
    $.ajax({
      url: 'http://localhost:3000/favorites',
      success: (result)=>{
        if(result && result.length > 0){
          result.forEach((movie)=>{
            $('#favorite-list').append(`<li id="${movie.imdbID}" class="list-group-item container"><div class="row"><div class="text-left col-sm-8">${movie.title}</div></div></li>`)
          });
        }else{
          $('#favorite-list').append(`<li class="list-group-item"><div class="text-center">You haven't favorited anything yet</div></li>`);
        }
        $('#favorite-box').toggle();
      }
    });
  });

  $('.close-info').click(()=>{
    $('#more-info').toggle();
    $('#more-info .modal-body ul').remove();
  });

  $('.close').click(()=>{
    $('#favorite-box').toggle();
  });

});