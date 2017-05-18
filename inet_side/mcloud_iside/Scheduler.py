
from utils.utils import decompress
from utils.utils import compress
from wiki import Wiki
from youtube import Youtube
import os, shutil, json

priority = {
    "wiki":0,
    "vademecum":1,
    "youtube":2
}

class Scheduler:
    def __init__(self):
        self.items=[]
        self.wiki = Wiki()
        self.youtube = Youtube()
        self.path = os.getcwd()

    def splitPath(self,petition):
        names = petition.split("/")
        names = names[len(names)-1].split(".")
        return names

    def remove_files(self, petition):
        with open(petition) as f:
            elem = f.readlines()
        for e in elem:
            if os.path.isfile("../out/"+e.strip()):
                os.remove("../out/"+e.strip());
        os.remove(petition);

    def enqueue(self, x):
        name = self.splitPath(x)[0]
        if(name == "remove"):
            print "remove"
            print x
            self.remove_files(x)
        else:
            splitPetition = name.split("_")
            typePetition = splitPetition[len(splitPetition)-1]
            self.insertOrderListPetition(priority[typePetition], x)

    def dequeue(self):
        try:
            return self.items.pop(0)
        except:
            raise ValueError("there are no petitions!")

    def isEmpty(self):
        return self.items == []

    def process(self):
        petition = self.dequeue()
        names = self.splitPath(petition)
        list = decompress(names[0], petition)
        os.remove(petition);
        listOut = []
        os.mkdir(list['dir']+"/result/")
        for l in list['listDir']:
            if names[0].split("_")[1] == "wiki":
                print names[0].split("_")[1]
                print names[0]
                params = self.wiki.search(l, names[0], list['dir']+"/result/")
                if params and len(params) > 0:
                    for d in params:
                        listOut.append(d)
            elif names[0].split("_")[1] == "youtube":
                print "youtube";
                self.youtube.search(l, names[0], list['dir']+"/result/")
        compress_file = names[0]+"_out.tar.gz"
        compress(listOut,list['dir']+"/result/", list['dir']+"/../"+compress_file)
        os.chdir(self.path)
        shutil.rmtree(list['dir'])
        

    def insertOrderListPetition(self, num, petition):
        i = 0
        if(len(self.items)>0):
            name = self.splitPath(self.items[i])[0]
            splitPetition = name.split("_")
            typePetition = splitPetition[len(splitPetition)-1]
            numType = priority[typePetition]
            i+=1
            while i < len(self.items) and numType <= num:
                name = self.splitPath(self.items[i])[0]
                splitPetition = name.split("_")
                typePetition = splitPetition[len(splitPetition)-1]
                numType = priority[typePetition]
                i+=1

            lenA = len(self.items)
            for j, val in self.items:
                self.items.insert(lenA-j, self.items[lenA-j-1])

        self.items.insert(i, petition)

            


    

