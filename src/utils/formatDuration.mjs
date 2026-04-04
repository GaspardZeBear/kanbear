//-------------------------------------------------------------------------
function getDurationFromNow(date, string) {
  let d = (Date.now() / 1000) - date
  if ( date == 0) {
    return
  }
  if (!string) {
    return (d)
  } else {
    return (formatDuration(d))
  }
}

//-----------------------------------------------------------------------

function formatDuration(seconds) {
  // Vérifier que l'entrée est un nombre valide
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return "00:00:00";
  }

  // Calculer les heures, minutes et secondes
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const secs = Math.floor(remainingSeconds % 60);

  // Formater chaque composant avec un zéro initial si nécessaire
  const formattedHours = hours.toString().padStart(3, '~');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = secs.toString().padStart(2, '0');

  // Retourner la chaîne formatée
  //return `${formattedHours}<b>h</b>${formattedMinutes}m${formattedSeconds}s`;
  return `${formattedHours}<b>h</b>${formattedMinutes}`;
}

//----------------------------------------------------------------------------
function dateToString(sinceEpochMs) {
  // Vérifier que l'entrée est un nombre valide
  if (typeof sinceEpochMs !== 'number' || isNaN(sinceEpochMs) || sinceEpochMs < 0) {
    return "?";
  }
  if (sinceEpochMs > 0) {
    return (`${new Date(1000 * sinceEpochMs).toUTCString().slice(4, -7)}`)
  } else {
    return ('')
  }
}

  //-----------------------------------------------------------------------------
  function toDateTime(yyyymmdd,hhmm) {
    if (yyyymmdd.length == 0) {
      return('')
    }
    let hhmm1=hhmm||'00:00'
    //let d=Date.parse(`${yyyymmdd}T${hhmm1}:00`)
    let d=`${yyyymmdd} ${hhmm1}:00`
    console.log("toDateTime() <yyymmdd>",yyyymmdd,"<hhmm>",hhmm,"<hhmm1>",hhmm1,"<d>",d)
    return(d)
  }

  //-----------------------------------------------------------------------------
  function fromDateTime(yyyymmddhhmm) {

    if (!yyyymmddhhmm || yyyymmddhhmm.length == 0) {
      return('','')
    }
    let t=yyyymmddhhmm.split(' ')
    console.log("fromDateTime() <yyymmddhhmm>",yyyymmddhhmm,"<date>",t[0],"<time>",t[1])
    return({date:t[0],time:t[1]})
  }


export { formatDuration, dateToString, getDurationFromNow, toDateTime, fromDateTime }