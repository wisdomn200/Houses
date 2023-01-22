import { useEffect, useState } from "react"
import { collection, 
            getDocs, 
            query, 
            where, 
            orderBy, 
            limit, 
            startAfter } from "firebase/firestore"
import { db } from "../firebase.config"
import { toast } from "react-toastify"
import Spinner from "../Components/Spinner"
import ListingItem from "../Components/ListingItem"

export default function Offers() {
    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastFetchedListing, setLastFetchedListing] = useState
    (null)

    useEffect(() => {
        const fetchListings = async () => {
            try {
                // Get reference
                const listingsRef = collection(db, 'listings')

                // Create a query
                const q = query(listingsRef, 
                  where('offer', '==', true), 
                  orderBy('timestamp', 'desc'),
                  limit(10)
                )

                // Execute query
                const querySnap = await getDocs(q)

                const lastVisible = await querySnap.docs[querySnap.docs.length
                  -1]
                setLastFetchedListing(lastVisible)
                  
                const listings = []

                querySnap.forEach((doc) => {
                    console.log(doc)
                    return listings.push({
                        id: doc.id,
                        data: doc.data()
                    })
                })

                setListings(listings)
                setLoading(false)

            } catch (error) {
                toast.error('Could not fetch listings')
            }
        }
        fetchListings()
    },[])

       // Pagination / Load More
       const onFetchMoreListings = async () => {
        try {
          // Get reference
          const listingsRef = collection(db, 'listings')
  
          // Create a query
          const q = query(
            listingsRef, 
            where('offer', '==', true), 
            orderBy('timestamp', 'desc'),
            startAfter(lastFetchedListing),
            limit(10)
            )
  
         // Execute query
         const querySnap = await getDocs(q)
  
         const lastVisible = await querySnap.docs[querySnap.docs.length
          -1]
          setLastFetchedListing(lastVisible)
  
            const listings = []
  
            querySnap.forEach((doc) => {
                console.log(doc.data)
                return listings.push({
                    id: doc.id,
                    data: doc.data()
                })
            })
  
            setListings((prevState) => [...prevState, ...listings])
            setLoading(false)
  
        } catch (error) {
            toast.error('Could not fetch listing')
        }
    }

  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          Offers
        </p>
      </header>

      {loading ? (
         <Spinner />
      ) : listings && listings.length > 0 ? (
      <>
        <main>
            <ul className="categoryListings">
                {listings.map((listing) => (
                    <ListingItem 
                        listing={listing.data}
                        id={listing.id}
                        key={listing.id} 
                        />
                ))}
            </ul>
        </main>


        <br />
        <br />
        {lastFetchedListing && (
          <p className="loadMore" onClick={onFetchMoreListings}
          >
            Load More</p>
        )}
      </>
      ) : ( 
        <p>There are no current offers</p>
      )}
    </div>
  )
}
