import React, {useState, useEffect} from 'react'
import classnames from 'classnames'
import {parse, differenceInSeconds, format} from 'date-fns'
import "./App.css"
import { PreviewSizer, PreviewSizes } from './PreviewSizer';

function App() {
  const [birdPics, setBirdPics] = useState([]);
  const [picDates, setPicDates] = useState([]);
  const [picGroups, setPicGroups] = useState([]);
  const [viewImage, setViewImage] = useState(null);
  const [updateTime, setUpdateTime] = useState(Date.now())
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [previewSize, setPreviewSize] = useState(PreviewSizes.SMALL);

  const nextPicture = () => {
    let index = birdPics.findIndex(bp => bp.full === viewImage.full);
    if (index < 0) return

    index++

    if (index < birdPics.length) {
      setViewImage(birdPics[index])
    }
  }

  const previousPicture = () => {
    let index = birdPics.findIndex(bp => bp.full === viewImage.full);
    if (index < 0) return

    index--

    if (index > 0) {
      setViewImage(birdPics[index])
    }
  }

  useEffect(() => {
    fetch('/api/list')
      .then(r => r.json())
      .then(d => {
        processImageList(d, setBirdPics, setPicDates, setPicGroups, setUpdateTime);
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
          <PreviewSizer 
            previewSize={previewSize}
            onSetPreviewSize={setPreviewSize}
          />
          <ul className="preview-scroll">
            {
              picGroups.length > 0 && picGroups.map((pg, i) => (
                <ImageGroup 
                  key={i} 
                  group={pg}
                  birdPics={birdPics} 
                  onClick={pic => {
                    setViewImage(pic)
                    setIsViewerOpen(true)
                  }} 
                  selectedPic={viewImage}
                  previewSize={previewSize}
                />
              ))
            }
          </ul>
        </div>
      </div>
      <ImageViewer 
        image={viewImage} 
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)} 
        onNext={nextPicture}
        onPrevious={previousPicture}
      />
    </>
  );
}

export function processImageList(d, setBirdPics, setPicDates, setPicGroups, setUpdateTime) {
  setBirdPics(d)

  setPicGroups(groupPicsByDate(d))
  setTimeout(() => setUpdateTime(Date.now()), 10000)
}

function ImageGroup({group, birdPics, dates, onClick, selectedPic, previewSize}) {
  const startDate = new Date(group[0].time * 1000);

  if (startDate == null) {
    return <div className='image-group'>ERROR!</div>
  }
  
  return (
    <div className='image-group'>
      <h5>{format(startDate, "HH:mm, E LLL d")}</h5>
      <div className='group-images'>
        {  
          group.map(g => (
            <ImagePreviewItem 
              key={g.full}
              birdPic={g}  
              onClick={() => onClick(g)} 
              isSelected={selectedPic && g && g.full === selectedPic.full} 
              previewSize={previewSize}
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
      {birdPic.full}
    </li>
  )
}

function ImagePreviewItem({birdPic, date, onClick, isSelected, previewSize}) {
  const classes = classnames('image-preview-item', previewSize, {'is-selected': isSelected});
  
  return (
    <div 
      className={classes}
      onClick={onClick}
    >
      {
        birdPic != null ?
        <img 
          src={"/thumb/" + birdPic.thumb} 
          alt={`${birdPic.classification[0].species} (${Math.round(birdPic.classification[0].confidence * 100)}%)`}
        /> :
        "error"
      }
    </div>
  )
}

function ImageViewer({image, isOpen, onClose, onNext, onPrevious}) {
  const close = () => {
    onClose();
  }

  if (!isOpen || image == null) {
    return <div />
  }

  return (
    <div className='image-viewer' onClick={close}>
      <div className='image-container' onClick={e => e.stopPropagation()}>
        <div className='close-btn' onClick={close}>close</div>
        <div className='next-btn' onClick={onNext}><div>{">"}</div></div>
        <div className='image'>
          <div className='previous-btn' onClick={onPrevious}><div>{"<"}</div></div>
          <img src={`/picture/${image.full}`} width="100%" />
        </div>
        <div className='image-info'>
          <div>
            <b>{image.classification[0].species}</b> ({Math.round(image.classification[0].confidence * 100)}%)
          </div>
          <div>
            1/{image.shutter} sec, ISO {image.iso}
          </div>
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

function groupPicsByDate(pics) {
  console.log(`[groupPicsByDate] pic count: ${pics.length}`)

  if (pics.length === 0) {
    return [];
  }

  let comparer = pics[0]
  let currentGroup = [comparer]
  const groups = []

  for (let i = 1; i < pics.length; i++) {
    const d = pics[i]
    const delta = comparer.time - d.time

    if (delta <= 90) {
      currentGroup.push(d)
      comparer = d
    } else {
      groups.push(currentGroup)
      currentGroup = [d]
      comparer = d
    }
  }

  groups.push(currentGroup)

  console.log(groups)
  return groups;
}

export default App;
