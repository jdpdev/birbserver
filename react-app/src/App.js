import React, {useState, useEffect} from 'react'
import classnames from 'classnames'
import {parse, differenceInSeconds, format} from 'date-fns'
import "./App.css"

function App() {
  const [birdPics, setBirdPics] = useState([]);
  const [picDates, setPicDates] = useState([]);
  const [picGroups, setPicGroups] = useState([]);
  const [viewImage, setViewImage] = useState(null);
  const [updateTime, setUpdateTime] = useState(Date.now())

  const nextPicture = () => {
    let index = birdPics.findIndex(bp => bp.name === viewImage);
    if (index < 0) return

    index++

    if (index < birdPics.length) {
      setViewImage(birdPics[index].name)
    }
  }

  const previousPicture = () => {
    let index = birdPics.findIndex(bp => bp.name === viewImage);
    if (index < 0) return

    index--

    if (index > 0) {
      setViewImage(birdPics[index].name)
    }
  }

  useEffect(() => {
    fetch('/api/list')
      .then(r => r.json())
      .then(d => {
        setBirdPics(d)

        const dates = d.map(bp => convertNameToDate(bp.name))
        setPicDates(dates)
        setPicGroups(groupPicsByDate(d, dates))
        setTimeout(() => setUpdateTime(Date.now()), 10000)
      })
      .catch(e => setBirdPics([{error: e}]))
  }, [updateTime])

  return (
    <>
      <div className="App">
        <div className="left">
          <img src={`/live&${updateTime}`} height="600px" width="800px" />
          {new Date(updateTime).toLocaleString()}
        </div>
        <div className="right">
          <ul>
            {
              picGroups.length > 0 && picGroups.map((pg, i) => (
                <ImageGroup 
                  key={i} 
                  group={pg}
                  birdPics={birdPics} 
                  dates={picDates}
                  onClick={(index) => setViewImage(birdPics[index].name)} 
                  selectedPic={viewImage}
                />
              ))
            }
          </ul>
        </div>
      </div>
      <ImageViewer 
        name={viewImage} 
        onClose={() => {}} 
        onNext={nextPicture}
        onPrevious={previousPicture}
      />
    </>
  );
}

function ImageGroup({group, birdPics, dates, onClick, selectedPic}) {
  const startDate = dates[group[group.length - 1]];
  
  return (
    <div className='image-group'>
      <h5>{format(startDate, "HH:mm, E LLL d")}</h5>
      <div className='group-images'>
        {  
          group.map(g => (
            <ImagePreviewItem 
              key={g}
              birdPic={birdPics[g]} 
              date={dates[g]} 
              onClick={() => onClick(g)} 
              isSelected={birdPics[g].name === selectedPic} 
            />))
        }
      </div>
    </div>
  )
}

function ImageListItem({birdPic, date, onClick, isSelected}) {
  return (
    <li 
      className={classnames({'viewed-image': isSelected})}
      onClick={onClick}
    >
      {birdPic.name}
    </li>
  )
}

function ImagePreviewItem({birdPic, date, onClick, isSelected}) {
  const classes = classnames('image-preview-item', {'is-selected': isSelected});
  
  return (
    <div 
      className={classes}
      onClick={onClick}
    >
      <img src={"/thumb/" + birdPic.thumb} />
    </div>
  )
}

function ImageViewer({name, onClose, onNext, onPrevious}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (name != null && !isOpen) {
      setIsOpen(true);
    }
  }, [name]);

  const close = () => {
    setIsOpen(false);
    onClose();
  }

  if (!isOpen || name == null) {
    return <div />
  }

  return (
    <div className='image-viewer' onClick={close}>
      <div className='image-container' onClick={e => e.stopPropagation()}>
        <div className='close-btn' onClick={close}>close</div>
        <div className='next-btn' onClick={onNext}><div>{">"}</div></div>
        <div className='image'>
          <div className='previous-btn' onClick={onPrevious}><div>{"<"}</div></div>
          <img src={`/picture/${name}`} width="100%" />
        </div>
      </div>
    </div>
  )
}

function convertNameToDate(name) {
  const ds = name.substring(0, name.length - 4);
  const parsed = parse(ds, 'yyyy-MM-dd-HH-mm-ss', new Date());
  return parsed;
}

function groupPicsByDate(pics, dates) {
  if (pics.length === 0) {
    return [];
  }

  let comparer = dates[0]
  let currentGroup = [0]
  const groups = []

  for (let i = 1; i < dates.length; i++) {
    const d = dates[i]
    const delta = differenceInSeconds(comparer, d)

    if (delta <= 90) {
      currentGroup.push(i)
      comparer = d
    } else {
      groups.push(currentGroup)
      currentGroup = [i]
      comparer = d
      i++
    }
  }

  groups.push(currentGroup)

  return groups;
}

export default App;
